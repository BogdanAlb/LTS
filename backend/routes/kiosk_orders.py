import json
import sqlite3
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field

from storage.db import db_dep

router = APIRouter(tags=["kiosk_orders"])

MAX_FORM_FIELDS = 160


class KioskOrderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    submitted_by: str | None = Field(default=None, max_length=120)
    fields: dict[str, Any] = Field(default_factory=dict)


class KioskOrderOut(BaseModel):
    id: int
    title: str
    submitted_by: str | None = None
    source_ip: str | None = None
    fields: dict[str, Any]
    created_at: str


def _normalize_title(value: str) -> str:
    normalized = value.strip()
    if not normalized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order title is required.",
        )
    if len(normalized) > 120:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order title is too long.",
        )
    return normalized


def _normalize_submitted_by(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    if not normalized:
        return None
    if len(normalized) > 120:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Submitted by is too long.",
        )
    return normalized


def _normalize_fields(fields: dict[str, Any]) -> dict[str, Any]:
    if len(fields) > MAX_FORM_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Too many form fields submitted.",
        )

    normalized: dict[str, Any] = {}
    for raw_key, raw_value in fields.items():
        key = str(raw_key).strip()
        if not key:
            continue
        if len(key) > 80:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A field name is too long.",
            )

        if raw_value is None or isinstance(raw_value, (bool, int, float)):
            normalized[key] = raw_value
            continue

        if isinstance(raw_value, str):
            value = raw_value.strip()
            if len(value) > 4000:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f'Field "{key}" is too long.',
                )
            normalized[key] = value
            continue

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Field "{key}" must be a scalar value.',
        )

    return normalized


def _row_to_model(row: sqlite3.Row) -> KioskOrderOut:
    try:
        fields = json.loads(row["fields_json"])
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored kiosk order payload is invalid.",
        ) from exc

    return KioskOrderOut(
        id=row["id"],
        title=row["title"],
        submitted_by=row["submitted_by"],
        source_ip=row["source_ip"],
        fields=fields,
        created_at=row["created_at"],
    )


@router.get("/orders", response_model=list[KioskOrderOut])
def list_kiosk_orders(
    limit: int = Query(default=10, ge=1, le=50),
    db: sqlite3.Connection = Depends(db_dep),
) -> list[KioskOrderOut]:
    rows = db.execute(
        """
        SELECT id, title, submitted_by, source_ip, fields_json, created_at
        FROM kiosk_order_submissions
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    return [_row_to_model(row) for row in rows]


@router.post("/orders", response_model=KioskOrderOut, status_code=status.HTTP_201_CREATED)
def create_kiosk_order(
    payload: KioskOrderCreate,
    request: Request,
    db: sqlite3.Connection = Depends(db_dep),
) -> KioskOrderOut:
    title = _normalize_title(payload.title)
    submitted_by = _normalize_submitted_by(payload.submitted_by)
    fields = _normalize_fields(payload.fields)
    source_ip = request.client.host if request.client else None

    cursor = db.execute(
        """
        INSERT INTO kiosk_order_submissions (title, submitted_by, source_ip, fields_json)
        VALUES (?, ?, ?, ?)
        """,
        (
            title,
            submitted_by,
            source_ip,
            json.dumps(fields, ensure_ascii=False, separators=(",", ":")),
        ),
    )

    row = db.execute(
        """
        SELECT id, title, submitted_by, source_ip, fields_json, created_at
        FROM kiosk_order_submissions
        WHERE id = ?
        """,
        (cursor.lastrowid,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load submitted kiosk order.",
        )
    return _row_to_model(row)
