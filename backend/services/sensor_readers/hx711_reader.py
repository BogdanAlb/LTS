import time
import RPi.GPIO as GPIO
from .hx711 import HX711

# Configurație pini și calibrare
DOUT_PIN = 5    # BCM 5
SCK_PIN = 6     # BCM 6
REFERENCE_UNIT = 114   # ajustează după calibrare
INTERVAL_SEC = 0.05     # timp între citiri

class HX711Reader:
    def __init__(self, dout_pin=DOUT_PIN, sck_pin=SCK_PIN, ref_unit=REFERENCE_UNIT):
        self.hx = HX711(dout_pin, sck_pin)
        self.hx.set_reference_unit(ref_unit)
        self.hx.reset()
        self.hx.tare()
        print("HX711 initialized and tared.")

    def read(self):
        try:
            weight = self.hx.get_weight_B(5)
            self.hx.power_down()
            self.hx.power_up()
            time.sleep(INTERVAL_SEC)
            return round(weight, 2)
        except Exception as e:
            print(f"[HX711Reader] Error: {e}")
            return None

    def cleanup(self):
        GPIO.cleanup()
