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
REFERENCE_UNIT = 114   # adjust after calibration
INTERVAL_SEC = 0.10    # 50 ms
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

# Reduce duplicate "channel in use" warnings
GPIO.setwarnings(False)

# tatobari/hx711py API:
hx = HX711(DOUT_PIN, SCK_PIN)
hx.set_reading_format("MSB", "MSB")
hx.set_reference_unit(REFERENCE_UNIT)
hx.reset()
hx.tare()

print("Initial tare done. Press 'T' to tare, 'Q' to quit. Printing every 0.05 s.")
print("")

next_t = time.monotonic()
try:
    while True:
        # Read one sample for low latency (increase to 2-5 for smoothing)
        grams = hx.get_weight(7)   # library returns approx grams after ref unit
        weight_kg = grams / 1000.0
        print(f"\rWeight: {weight_kg:0.3f} kg", end="", flush=True)

        key = get_key_nonblocking()
        if key:
            k = key.lower()
            if k == 't':
                print("\nTare in progress...")
                hx.tare()
                print("Tare done.")
            elif k == 'q':
                clean_and_exit()

        # precise 50 ms pacing
        next_t += INTERVAL_SEC
        sleep_time = next_t - time.monotonic()
        if sleep_time > 0:
            time.sleep(sleep_time)
        else:
            next_t = time.monotonic()

except (KeyboardInterrupt, SystemExit):
    clean_and_exit()
