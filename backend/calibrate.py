from services.sensor_readers.hx711 import HX711
import time

DOUT_PIN = 5
SCK_PIN = 6

hx = HX711(DOUT_PIN, SCK_PIN)
hx.set_reference_unit(1)
hx.reset()
hx.tare()
print("Tare done. Place known weight on the load cell...")

while True:
    try:
        val = hx.get_weight(5)
        print(f"Raw value: {val}")
        hx.power_down()
        hx.power_up()
        time.sleep(0.2)
    except KeyboardInterrupt:
        print("Calibration stopped.")
        break
