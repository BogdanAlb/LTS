# backend/routes/sensor.py
from fastapi import APIRouter
from services.sensor_readers.hx711_reader import HX711Reader

router = APIRouter(prefix="/sensors", tags=["sensors"])
hx = HX711Reader()

@router.get("/hx711")
def read_weight():
    val_g = hx.read()              # trebuie să RETURNZE grame!
    return {"weight_g": float(val_g)}