from fastapi import APIRouter
from services.sensor_readers.hx711_reader import HX711Reader
import subprocess

router = APIRouter(tags=["sensors"])
hx = HX711Reader()

@router.get("/hx711")
def read_weight():
    val = hx.read()
    return {"weight_g": val}

@router.post("/hx711/tare")
def tare_sensor():
    hx.hx.zero()
    return {"status": "tare done"}

@router.get("/wifi")
def get_wifi_strength():
    try:
        output = subprocess.check_output("iwconfig wlan0", shell=True, text=True)
        for line in output.splitlines():
            if "Signal level" in line:
                parts = line.split("Signal level=")
                if len(parts) > 1:
                    level_dbm = int(parts[1].split(" ")[0])
                    percent = max(0, min(100, 2 * (level_dbm + 100)))
                    return {"wifi_percent": percent}
        return {"wifi_percent": 0}
    except Exception as e:
        return {"wifi_percent": 0, "error": str(e)}
