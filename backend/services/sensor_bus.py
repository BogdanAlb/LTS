# sensor catalog/config
from services.sensor_readers.hx711_reader import HX711Reader
import asyncio

class SensorBus:
    def __init__(self):
        self.hx = HX711Reader()
        self.running = False

    async def start(self):
        self.running = True
        asyncio.create_task(self._loop())

    async def _loop(self):
        while self.running:
            value = self.hx.read()
            if value is not None:
                print(f"[HX711] Current weight: {value:.2f} g")
            await asyncio.sleep(0.2)

    async def stop(self):
        self.running = False
        self.hx.cleanup()
