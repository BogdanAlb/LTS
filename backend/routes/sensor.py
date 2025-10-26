from fastapi import APIRouter
from services.sensor_readers.hx711_reader import HX711Reader
import subprocess

router = APIRouter(prefix="/sensors", tags=["sensors"])
hx = HX711Reader()

@router.get("/hx711")
def read_weight():
    val = hx.read()
    return {"weight_g": val}

@router.post("/hx711/tare")
def tare_sensor():
    """Resetează (tare) senzorul HX711"""
    hx.hx.zero()  # metoda zero() efectuează tăruirea
    return {"status": "tare done"}

router.get("/wifi")
@router.get("/wifi")
def get_wifi_strength():
    """Returnează nivelul semnalului Wi-Fi (0–100 %)."""
    try:
        # Execută comanda `iwconfig` pentru wlan0
        output = subprocess.check_output("iwconfig wlan0", shell=True, text=True)
        # Extrage semnalul (ex: "Signal level=-45 dBm")
        for line in output.splitlines():
            if "Signal level" in line:
                parts = line.split("Signal level=")
                if len(parts) > 1:
                    level_dbm = int(parts[1].split(" ")[0])
                    # Conversie dBm (-100 → 0 %) – (-50 → 100 %)
                    percent = max(0, min(100, 2 * (level_dbm + 100)))
                    return {"wifi_percent": percent}
        return {"wifi_percent": 0}
    except Exception as e:
        return {"wifi_percent": 0, "error": str(e)}