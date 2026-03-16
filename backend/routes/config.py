"""
backend/routes/configs.py

Adaugă în app.py:
    from routes.configs import router as configs_router
    app.include_router(configs_router, prefix="/configs", tags=["configs"])
"""
import sqlite3
import pathlib
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()
DB_PATH = pathlib.Path(__file__).parent.parent / "storage" / "lts.db"


# ── helpers ────────────────────────────────────────────────────────────────

def get_db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA journal_mode=WAL")
    con.execute("PRAGMA foreign_keys=ON")
    return con


# ── modele Pydantic ─────────────────────────────────────────────────────────

class ConfigIn(BaseModel):
    nume:       str  = Field(..., min_length=1, max_length=120)
    contract:   str  = Field(..., min_length=1, max_length=80)
    dimensiune: Optional[float] = None
    lungime:    Optional[float] = None


class ConfigOut(ConfigIn):
    id:          int
    created_at:  str
    updated_at:  str
    synced_from: str


# ── endpoints ────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[ConfigOut])
def list_configs():
    """Returnează toate configurațiile, ordonate invers după dată."""
    con = get_db()
    rows = con.execute(
        "SELECT * FROM configs ORDER BY updated_at DESC"
    ).fetchall()
    con.close()
    return [dict(r) for r in rows]


@router.get("/{config_id}", response_model=ConfigOut)
def get_config(config_id: int):
    con = get_db()
    row = con.execute(
        "SELECT * FROM configs WHERE id = ?", (config_id,)
    ).fetchone()
    con.close()
    if not row:
        raise HTTPException(status_code=404, detail="Config negăsit")
    return dict(row)


@router.post("/", response_model=ConfigOut, status_code=201)
def create_config(data: ConfigIn):
    con = get_db()
    now = datetime.utcnow().isoformat(timespec="seconds")
    cur = con.execute(
        """INSERT INTO configs (nume, contract, dimensiune, lungime,
                                created_at, updated_at, synced_from)
           VALUES (?, ?, ?, ?, ?, ?, 'local')""",
        (data.nume, data.contract, data.dimensiune, data.lungime, now, now),
    )
    con.commit()
    row = con.execute(
        "SELECT * FROM configs WHERE id = ?", (cur.lastrowid,)
    ).fetchone()
    con.close()
    return dict(row)


@router.put("/{config_id}", response_model=ConfigOut)
def update_config(config_id: int, data: ConfigIn):
    con = get_db()
    now = datetime.utcnow().isoformat(timespec="seconds")
    cur = con.execute(
        """UPDATE configs
           SET nume=?, contract=?, dimensiune=?, lungime=?, updated_at=?
           WHERE id=?""",
        (data.nume, data.contract, data.dimensiune, data.lungime, now, config_id),
    )
    con.commit()
    if cur.rowcount == 0:
        con.close()
        raise HTTPException(status_code=404, detail="Config negăsit")
    row = con.execute(
        "SELECT * FROM configs WHERE id = ?", (config_id,)
    ).fetchone()
    con.close()
    return dict(row)


@router.delete("/{config_id}", status_code=204)
def delete_config(config_id: int):
    con = get_db()
    cur = con.execute("DELETE FROM configs WHERE id = ?", (config_id,))
    con.commit()
    con.close()
    if cur.rowcount == 0:
        raise HTTPException(status_code=404, detail="Config negăsit")