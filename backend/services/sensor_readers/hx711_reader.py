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
SCALE_RATIO = 44.3   # echivalent cu REFERENCE_UNIT inversat
INTERVAL_SEC = 0.5         # 500 ms
# ------------------------------

def clean_and_exit():
    print("\nCleaning GPIO and exit...")
    try:
        GPIO.cleanup()
    except Exception:
        pass
    sys.exit(0)

def get_key_nonblocking():
    """Return one char if a key is pressed, else None (no Enter needed)."""
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

# ---------- GPIO init ----------
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
# -------------------------------

# ---------- HX711 init ----------
hx = HX711(dout_pin=DOUT_PIN, pd_sck_pin=SCK_PIN)
hx.reset()
hx.zero()
hx.set_scale_ratio(SCALE_RATIO)
# -------------------------------

print("Initial tare done. Press 'T' to tare, 'Q' to quit.")
print("")

next_t = time.monotonic()
try:
    while True:
        # Citește o medie de 7 probe
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

        # temporizare precisă
        next_t += INTERVAL_SEC
        sleep_time = next_t - time.monotonic()
        if sleep_time > 0:
            time.sleep(sleep_time)
        else:
            next_t = time.monotonic()

except (KeyboardInterrupt, SystemExit):
    clean_and_exit()