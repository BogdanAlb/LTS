# FastAPI factory, lifespan handlers
from fastapi import FastAPI

app = FastAPI()

@app.on_event("startup")
def health():
    return {"ok": True}
#run
uvicorn app:app --reload --port 8080