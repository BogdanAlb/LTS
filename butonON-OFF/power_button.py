#!/usr/bin/env python3
"""
Power button + optional power LED controller for Raspberry Pi.

Wiring assumptions:
- Button: between BUTTON_PIN and GND (uses internal pull-up).
- LED "pro" mode: LED+ to LED_PIN through 220-330 ohm, LED- to GND.
- LED "rapid" mode: LED wired directly to 3.3V is always ON and not controlled here.
"""

from __future__ import annotations

import importlib
import os
import subprocess
import time
from typing import Any


GPIO_AVAILABLE = True
GPIO_IMPORT_ERROR: ModuleNotFoundError | None = None

try:
    GPIO: Any = importlib.import_module("RPi.GPIO")
except ModuleNotFoundError as exc:
    GPIO_AVAILABLE = False
    GPIO_IMPORT_ERROR = exc

    class _GPIOStub:
        BCM = 11
        IN = 1
        OUT = 0
        PUD_UP = 2
        LOW = 0
        HIGH = 1

        def __getattr__(self, _name: str) -> Any:
            raise RuntimeError(
                "RPi.GPIO is not available in this Python environment. "
                "Run this script on a Raspberry Pi with python3-rpi.gpio installed."
            ) from GPIO_IMPORT_ERROR

    GPIO = _GPIOStub()


# -------------------------
# User settings (BCM pins)
# -------------------------
BUTTON_PIN = 27
LED_PIN = 17
USE_GPIO_LED = True

SHUTDOWN_HOLD_SECONDS = 2.0
POLL_INTERVAL_SECONDS = 0.05

# Button is active when pulled to GND
BUTTON_ACTIVE_STATE = GPIO.LOW


def setup_gpio() -> None:
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(BUTTON_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    if USE_GPIO_LED:
        # LED ON while script is running (OS up)
        GPIO.setup(LED_PIN, GPIO.OUT, initial=GPIO.HIGH)


def cleanup_gpio() -> None:
    try:
        if USE_GPIO_LED:
            GPIO.output(LED_PIN, GPIO.LOW)
    finally:
        GPIO.cleanup()


def blink_led_ack() -> None:
    if not USE_GPIO_LED:
        return

    for _ in range(3):
        GPIO.output(LED_PIN, GPIO.LOW)
        time.sleep(0.12)
        GPIO.output(LED_PIN, GPIO.HIGH)
        time.sleep(0.12)


def request_shutdown() -> bool:
    # If script runs as root (recommended as systemd service), no sudo is needed.
    command = ["shutdown", "-h", "now"] if os.geteuid() == 0 else ["sudo", "shutdown", "-h", "now"]

    print("Shutdown requested...")
    try:
        result = subprocess.run(command, check=False)
    except FileNotFoundError as exc:
        print(f"Cannot run shutdown command: {exc}")
        return False

    if result.returncode != 0:
        print(f"Shutdown command failed with code {result.returncode}.")
        return False

    return True


def wait_for_long_press() -> None:
    pressed_since: float | None = None

    while True:
        pressed = GPIO.input(BUTTON_PIN) == BUTTON_ACTIVE_STATE
        now = time.monotonic()

        if pressed and pressed_since is None:
            pressed_since = now
        elif not pressed:
            pressed_since = None
        elif pressed_since is not None and (now - pressed_since) >= SHUTDOWN_HOLD_SECONDS:
            return

        time.sleep(POLL_INTERVAL_SECONDS)


def main() -> int:
    if not GPIO_AVAILABLE:
        print(
            "RPi.GPIO module not found. Install it with: "
            "sudo apt install python3-rpi.gpio"
        )
        return 1

    setup_gpio()

    print("power_button.py started")
    print(f"Button GPIO (BCM): {BUTTON_PIN}")
    if USE_GPIO_LED:
        print(f"LED GPIO (BCM): {LED_PIN}")
    else:
        print("LED GPIO control disabled (rapid wiring mode)")
    print(f"Hold button for {SHUTDOWN_HOLD_SECONDS:.1f}s to shutdown")

    try:
        while True:
            wait_for_long_press()
            blink_led_ack()

            if request_shutdown():
                # Give the system a moment to continue shutdown sequence.
                time.sleep(1.0)
                return 0

            # If shutdown failed, avoid rapid retrigger while button is held.
            while GPIO.input(BUTTON_PIN) == BUTTON_ACTIVE_STATE:
                time.sleep(POLL_INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("Interrupted by user.")
        return 0
    finally:
        cleanup_gpio()


if __name__ == "__main__":
    raise SystemExit(main())
