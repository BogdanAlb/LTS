from fastapi import FastAPI
from routes import sensor
from storage.db import init_db
from fastapi.middleware.cors import CORSMiddleware
from routes import sensor as sensors
from routes import measurements

app = FastAPI(title="LTS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor.router, prefix="/sensors", tags=["sensors"])
app.include_router(measurements.router, prefix="/measurements", tags=["measurements"])


@app.on_event("startup")
def _startup_db() -> None:
    """Initialize SQLite (WAL, pragmas) on app start."""
    init_db()

@app.get("/")
def root():
    return {"status": "LTS Backend is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)
