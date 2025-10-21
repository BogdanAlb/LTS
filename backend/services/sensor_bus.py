import asyncio
from services.sensor_readers.hx711_reader import HX711Reader

class SensorBus:
    def __init__(self):
        self.hx711 = HX711Reader()
        self.running = False

    async def start(self):
        self.running = True
        asyncio.create_task(self._loop())

    async def _loop(self):
        while self.running:
            val = self.hx711.read()
            if val is not None:
                print(f"[SensorBus] Weight: {val} g")
            await asyncio.sleep(0.2)

    async def stop(self):
        self.running = False
        self.hx711.cleanup()
