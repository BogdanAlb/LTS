                # services/sensor_readers/hx711_reader.py
# -*- coding: utf-8 -*-
import time
import RPi.GPIO as GPIO
from hx711 import HX711

DOUT_PIN = 5    # BCM 5
SCK_PIN  = 6    # BCM 6
REFERENCE_UNIT = 1.14   # Ajustează după calibrare
INTERVAL_SEC = 0.05     # 50 ms

class HX711Reader:
    def __init__(self, dout_pin=DOUT_PIN, sck_pin=SCK_PIN, ref_unit=REFERENCE_UNIT):
        self.dout = dout_pin
        self.sck = sck_pin
        self.ref_unit = ref_unit
        self.hx = HX711(dout_pin, sck_pin)
        self.hx.set_reference_unit(ref_unit)
        self.hx.reset()
        self.hx.tare()
        print("HX711 tare completed")

    def read(self):
        try:
            val = self.hx.get_weight(5)
            self.hx.power_down()
            self.hx.power_up()
            time.sleep(INTERVAL_SEC)
            return val
        except Exception as e:
            print(f"HX711 read error: {e}")
            return None

    def cleanup(self):
        GPIO.cleanup()
