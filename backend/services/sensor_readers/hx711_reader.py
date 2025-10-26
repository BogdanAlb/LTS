# -*- coding: utf-8 -*-
import time
import sys
import termios
import tty
import select
import RPi.GPIO as GPIO
from hx711 import HX711

# ---------- settings ----------
DOUT_PIN = 5   # BCM 5
SCK_PIN  = 6   # BCM 6
SCALE_RATIO = 44.3
INTERVAL_SEC = 0.5
# ------------------------------


class HX711Reader:
    def __init__(self, dout_pin=5, sck_pin=6, scale_ratio=44.3):
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        self.hx = HX711(dout_pin=dout_pin, pd_sck_pin=sck_pin)
        self.hx.reset()
        self.hx.zero()
        self.hx.set_scale_ratio(scale_ratio)

    def read(self, samples=7):
        """Citește greutatea medie (în grame)."""
        grams = self.hx.get_weight_mean(samples)
        grams_rounded = int(grams / 10) * 10
        return round(grams_rounded, 1)


# ---------- Funcții auxiliare doar pentru testare locală ----------
def clean_and_exit():
    print("\nCleaning GPIO and exit...")
    try:
        GPIO.cleanup()
    except Exception:
        pass
    sys.exit(0)

def get_key_nonblocking():
    dr, _, _ = select.select([sys.stdin], [], [], 0)
    if not dr:
        return None
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)
    return ch
# -----------------------------------------------------------------


# ---------- Modul principal (rulează DOAR dacă fișierul e pornit direct) ----------
if __name__ == "__main__":
    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)

    hx = HX711(dout_pin=DOUT_PIN, pd_sck_pin=SCK_PIN)
    hx.reset()
    hx.zero()
    hx.set_scale_ratio(SCALE_RATIO)

    print("Initial tare done. Press 'T' to tare, 'Q' to quit.")
    print("")

    next_t = time.monotonic()
    try:
        while True:
            grams = hx.get_weight_mean(7)
            grams_rounded = int(grams / 10) * 10
            print(f"\rWeight: {grams_rounded:.0f} g ({grams_rounded/1000:.3f} kg)", end="", flush=True)

            key = get_key_nonblocking()
            if key:
                k = key.lower()
                if k == 't':
                    print("\nTare in progress...")
                    hx.zero()
                    print("Tare done.")
                elif k == 'q':
                    clean_and_exit()

            next_t += INTERVAL_SEC
            sleep_time = next_t - time.monotonic()
            if sleep_time > 0:
                time.sleep(sleep_time)
            else:
                next_t = time.monotonic()

    except (KeyboardInterrupt, SystemExit):
        clean_and_exit()
# -----------------------------------------------------------------