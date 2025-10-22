import asyncio
from typing import Callable, Optional
from services.sensor_readers.hx711_reader import HX711Reader

class SensorBus:
    def __init__(self, on_read: Optional[Callable[[float], None]] = None, period: float = 0.2):
        """
        on_read: callback opțional care primește greutatea în grame.
        period: intervalul de eșantionare în secunde.
        """
        self.hx711 = HX711Reader()
        self.running = False
        self._task: Optional[asyncio.Task] = None
        self._period = float(period)
        self._on_read = on_read

    async def start(self):
        if self.running:
            return  # deja pornit
        self.running = True
        # Păstrăm referința la task pentru oprire ordonată
        self._task = asyncio.create_task(self._loop(), name="SensorBusLoop")

    async def _loop(self):
        try:
            while self.running:
                try:
                    # Dacă read() e blocant, rulează-l într-un thread
                    val = await asyncio.to_thread(self.hx711.read)
                    if val is not None:
                        if self._on_read:
                            self._on_read(val)
                        else:
                            print(f"[SensorBus] Weight: {val:.2f} g")
                except Exception as e:
                    # Log de siguranță; nu omorâm bucla dintr-o excepție singulară
                    print(f"[SensorBus] Eroare la citire: {e}")
                await asyncio.sleep(self._period)
        finally:
            # Curățenie la ieșire din buclă
            try:
                self.hx711.cleanup()
            except Exception as e:
                print(f"[SensorBus] Eroare la cleanup: {e}")

    async def stop(self):
        if not self.running:
            return  # deja oprit
        self.running = False
        # Așteptăm terminarea task-ului
        if self._task:
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            finally:
                self._task = None
