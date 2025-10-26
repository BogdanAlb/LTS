# backend/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import sensor

app = FastAPI()

# CORS – permite frontendului să apeleze API-ul
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # sau pune aici exact originea frontendului
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routerul
app.include_router(sensor.router)

# rulează uvicorn cu: python3 app.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)