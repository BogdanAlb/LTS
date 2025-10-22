import RPi.GPIO as GPIO
import time
import threading


class HX711:
    def __init__(self, dout, pd_sck, gain=128):
        self.PD_SCK = pd_sck
        self.DOUT = dout
        self.readLock = threading.Lock()

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.PD_SCK, GPIO.OUT)
        GPIO.setup(self.DOUT, GPIO.IN)

        self.GAIN = 0
        self.OFFSET = 1
        self.REFERENCE_UNIT = 1
        self.lastVal = 0

        self.byte_format = "MSB"
        self.bit_format = "MSB"

        self.set_gain(gain)
        time.sleep(1)

    # ---------- Low-level I/O ----------
    def is_ready(self):
        return GPIO.input(self.DOUT) == 0

    def set_gain(self, gain):
        if gain == 128:
            self.GAIN = 1
        elif gain == 64:
            self.GAIN = 3
        elif gain == 32:
            self.GAIN = 2
        GPIO.output(self.PD_SCK, False)
        self.readRawBytes()

    def readNextBit(self):
        GPIO.output(self.PD_SCK, True)
        GPIO.output(self.PD_SCK, False)
        return GPIO.input(self.DOUT)

    def readNextByte(self):
        byteValue = 0
        for _ in range(8):
            if self.bit_format == "MSB":
                byteValue <<= 1
                byteValue |= self.readNextBit()
            else:
                byteValue >>= 1
                byteValue |= self.readNextBit() * 0x80
        return byteValue

    def readRawBytes(self):
        self.readLock.acquire()
        while not self.is_ready():
            pass
        data = [self.readNextByte() for _ in range(3)]
        for _ in range(self.GAIN):
            self.readNextBit()
        self.readLock.release()
        return data

    # ---------- Conversion ----------
    def convertFromTwosComplement24bit(self, value):
        return -(value & 0x800000) + (value & 0x7fffff)

    def read_long(self):
        bytes_data = self.readRawBytes()
        value = (bytes_data[0] << 16) | (bytes_data[1] << 8) | bytes_data[2]
        signed = self.convertFromTwosComplement24bit(value)
        self.lastVal = signed
        return signed

    def read_average(self, times=3):
        values = [self.read_long() for _ in range(times)]
        return sum(values) / len(values)

    # ---------- Calibration & Reading ----------
    def set_reference_unit(self, ref_unit):
        if ref_unit == 0:
            raise ValueError("Reference unit cannot be zero")
        self.REFERENCE_UNIT = ref_unit

    def set_offset(self, offset):
        self.OFFSET = offset

    def tare(self, times=15):
        self.set_offset(self.read_average(times))
        return self.OFFSET

    def get_weight_A(self, times=5):
        # pentru canalul B (gain = 32)
        g = self.GAIN
        self.set_gain(128)
        val = self.read_average(times) - self.OFFSET
        self.set_gain(g)
        return val / self.REFERENCE_UNIT

    # ---------- Power control ----------
    def power_down(self):
        self.readLock.acquire()
        GPIO.output(self.PD_SCK, False)
        GPIO.output(self.PD_SCK, True)
        time.sleep(0.0001)
        self.readLock.release()

    def power_up(self):
        self.readLock.acquire()
        GPIO.output(self.PD_SCK, False)
        time.sleep(0.0001)
        self.readLock.release()

    def reset(self):
        self.power_down()
        self.power_up()
