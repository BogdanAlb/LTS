# hx711.py
# Curat, stabil, canal A @128x si suport optional pentru B @32x.
# Necesita: RPi.GPIO

import time
import RPi.GPIO as GPIO


class HX711:
    """
    Driver simplu si robust pentru HX711.
    - Foloseste numerotare pini BCM.
    - Implicit citeste canalul A la 128x (standard pentru load cell 4 fire).
    - Format de citire: MSB/MSB.
    """

    def __init__(self, dout_pin: int, pd_sck_pin: int, gpio_mode=GPIO.BCM):
        self.DOUT = dout_pin
        self.PD_SCK = pd_sck_pin

        GPIO.setmode(gpio_mode)
        GPIO.setup(self.PD_SCK, GPIO.OUT)
        GPIO.setup(self.DOUT, GPIO.IN)

        # Setari de scala
        self.OFFSET = 0
        self.REFERENCE_UNIT = 1.0

        # Gain intern HX711:
        # 128 (A), 64 (A), 32 (B)
        self._gain = 128
        self._gain_channel_pulses = 1  # 1=128(A), 3=64(A), 2=32(B)

        self.set_gain(128)  # standard
        self.reset()

    # -------------------- Config & utilitare --------------------

    def set_reference_unit(self, reference_unit: float):
        if reference_unit == 0:
            raise ValueError("REFERENCE_UNIT nu poate fi 0.")
        self.REFERENCE_UNIT = float(reference_unit)

    def get_reference_unit(self) -> float:
        return self.REFERENCE_UNIT

    def set_gain(self, gain: int):
        """
        Seteaza gain + canal (pregateste conversia urmatoare).
        gain = 128 -> canal A, 128x (1 puls)
        gain = 64  -> canal A,  64x (3 pulsi)
        gain = 32  -> canal B,  32x (2 pulsi)
        """
        if gain not in (128, 64, 32):
            raise ValueError("Gain invalid. Foloseste 128, 64 sau 32.")
        self._gain = gain
        if gain == 128:
            self._gain_channel_pulses = 1
        elif gain == 64:
            self._gain_channel_pulses = 3
        else:  # 32
            self._gain_channel_pulses = 2

        # O citire dummy pentru a aplica gainul (conform datasheet)
        self._read_signed_24bit()

    def get_gain(self) -> int:
        return self._gain

    def is_ready(self) -> bool:
        # DOUT LOW = date gata
        return GPIO.input(self.DOUT) == 0

    def wait_ready(self, timeout: float = 1.0) -> bool:
        t0 = time.time()
        while not self.is_ready():
            if time.time() - t0 > timeout:
                return False
            time.sleep(0.001)
        return True

    # -------------------- Rutina de citire --------------------

    def _read_signed_24bit(self) -> int:
        """
        Citeste o conversie (24 biti) si seteaza gainul pentru urmatorul ciclu,
        conform _gain_channel_pulses.
        Intoarce valoarea semnata pe 24 biti (two's complement).
        """
        if not self.wait_ready(timeout=1.0):
            raise TimeoutError("HX711 nu este gata (DOUT nu a devenit LOW).")

        data = 0
        # Citire 24 biti, MSB first
        for _ in range(24):
            GPIO.output(self.PD_SCK, True)
            # mica pauza pentru stabilitate
            time.sleep(0.000001)
            GPIO.output(self.PD_SCK, False)
            bit = GPIO.input(self.DOUT)
            data = (data << 1) | bit

        # Pulsi suplimentari pentru a seta canalul/gain-ul urmator
        for _ in range(self._gain_channel_pulses):
            GPIO.output(self.PD_SCK, True)
            time.sleep(0.000001)
            GPIO.output(self.PD_SCK, False)

        # Convertire la semnat pe 24b (two's complement)
        if data & 0x800000:
            data -= 0x1000000

        return data

    def read_raw(self) -> int:
        """Valoare bruta semnata (cu offset)."""
        return self._read_signed_24bit()

    def read_average(self, times: int = 7) -> float:
        if times <= 0:
            raise ValueError("times trebuie sa fie > 0")
        total = 0
        for _ in range(times):
            total += self._read_signed_24bit()
        return total / float(times)

    def tare(self, times: int = 15):
        """
        Stabileste OFFSET-ul (zero). Fa tare cu sarcina scoasa.
        IMPORTANT: apeleaza tare pe acelasi canal/gain pe care vei citi.
        """
        avg = self.read_average(times)
        self.OFFSET = avg

    def get_value(self, times: int = 7) -> float:
        return self.read_average(times) - self.OFFSET

    def get_weight(self, times: int = 7) -> float:
        """
        Greutatea pe canalul/gain-ul curent, folosind REFERENCE_UNIT.
        Returneaza 'unitati' definite de REFERENCE_UNIT (de ex. grame).
        """
        value = self.get_value(times)
        return value / self.REFERENCE_UNIT

    # -------------------- Confort: A si B dedicate --------------------

    def get_weight_A(self, times: int = 7) -> float:
        """Citeste pe A @128x (standard)."""
        prev = self._gain
        try:
            if self._gain != 128:
                self.set_gain(128)
            return self.get_weight(times)
        finally:
            if prev != 128:
                self.set_gain(prev)

    def get_weight_B(self, times: int = 7) -> float:
        """Citeste pe B @32x (daca ai cablat pe canalul B)."""
        prev = self._gain
        try:
            if self._gain != 32:
                self.set_gain(32)
            return self.get_weight(times)
        finally:
            if prev != 32:
                self.set_gain(prev)

    # -------------------- Control putere --------------------

    def power_down(self):
        GPIO.output(self.PD_SCK, False)
        time.sleep(0.000005)
        GPIO.output(self.PD_SCK, True)
        time.sleep(0.0001)

    def power_up(self):
        GPIO.output(self.PD_SCK, False)
        time.sleep(0.0001)

    def reset(self):
        self.power_down()
        self.power_up()

    # -------------------- Curatenie --------------------

    def cleanup(self):
        GPIO.cleanup((self.PD_SCK, self.DOUT))
