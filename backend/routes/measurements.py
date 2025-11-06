# ~/LTS/backend/routes/measurements.py
import asyncio, sqlite3, datetime, random
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# --- HX711: încearcă driverul tău; dacă nu merge, folosește un fallback demo ---
try:
    from services.sensor_readers.hx711_reader import HX711Reader
    hx = HX711Reader(dout=5, pd_sck=6, gain=128)  # TODO: ajustează pinii/calibrarea pentru placa ta
    def read_weight() -> float:
        return float(hx.get_weight())
except Exception:
    hx = None
    def read_weight() -> float:
        # DEMO: scoate asta în producție
        return 500 + random.uniform(-10, 10)

def _utc_now_iso_z() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")

class MeasurementController:
    def __init__(self, db_path: str = "lts.db"):
        self.running = False
        self._task = None
        self.clients = set()
        self.db = sqlite3.connect(db_path, check_same_thread=False)
        self.db.execute("PRAGMA journal_mode=WAL;")
        self.db.execute("PRAGMA synchronous=NORMAL;")
        self.db.execute("""
            CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ts TEXT NOT NULL,
                value REAL NOT NULL
            )
        """)
        self.db.commit()

    async def _loop(self):
        while self.running:
            value = float(read_weight())  # citirea reală
            ts = _utc_now_iso_z()
            self.db.execute("INSERT INTO measurements (ts, value) VALUES (?, ?)", (ts, value))
            self.db.commit()

            # trimite la toți clienții WS
            dead = []
            for ws in list(self.clients):
                try:
                    await ws.send_json({"ts": ts, "value": value})
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.clients.discard(ws)

            await asyncio.sleep(0.25)  # ~4 Hz

    async def start(self):
        if self.running:
            return
        self.running = True
        self._task = asyncio.create_task(self._loop())

    async def stop(self):
        self.running = False
        # task-ul se va închide după următorul sleep

controller = MeasurementController()

@router.post("/start")
async def start():
    await controller.start()
    return {"running": True}

@router.post("/stop")
async def stop():
    await controller.stop()
    return {"running": False}

@router.get("/history")
def history(limit: int = 1000):
    cur = controller.db.execute(
        "SELECT ts, value FROM measurements ORDER BY id DESC LIMIT ?",
        (int(limit),)
    )
    rows = cur.fetchall()
    rows.reverse()  # crescător în timp
    return {"data": [{"ts": ts, "value": v} for ts, v in rows]}

@router.websocket("/ws")
async def ws(stream: WebSocket):
    await stream.accept()
    controller.clients.add(stream)
    try:
        while True:
            await asyncio.sleep(3600)
    except WebSocketDisconnect:
        pass
    finally:
        controller.clients.discard(stream)