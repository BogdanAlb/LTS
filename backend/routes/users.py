import re
import sqlite3
import hashlib
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from pydantic import BaseModel, Field

from storage.db import db_dep

router = APIRouter(tags=["users"])

USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9._-]+$")
PIN_PATTERN = re.compile(r"^\d{4}$")
ALLOWED_LANGUAGES = {"ro", "en", "de"}
ALLOWED_THEMES = {"night", "day"}


class UserOut(BaseModel):
    id: int
    username: str
    role: Literal["admin", "restricted"]
    created_at: str


class UserSettingsOut(BaseModel):
    language: str
    theme: str
    updated_at: str | None = None


class LoginResponse(BaseModel):
    user: UserOut
    settings: UserSettingsOut


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    role: Literal["admin", "restricted"] = "restricted"
    pin: str = Field(min_length=4, max_length=4)


class UserLogin(BaseModel):
    user_id: int = Field(gt=0)
    pin: str = Field(min_length=4, max_length=4)


class UserSettingsUpdate(BaseModel):
    language: str | None = None
    theme: str | None = None


def _hash_pin(pin: str) -> str:
    return hashlib.sha256(pin.encode("utf-8")).hexdigest()


def _validate_pin(pin: str) -> None:
    if not PIN_PATTERN.fullmatch(pin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PIN must contain exactly 4 digits.",
        )


def _require_actor(db: sqlite3.Connection, actor_id: int | None) -> sqlite3.Row:
    if actor_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-Actor-Id header is required.",
        )

    actor = db.execute(
        "SELECT id, role FROM users WHERE id = ?",
        (actor_id,),
    ).fetchone()
    if actor is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Actor user not found.",
        )
    return actor


def _normalize_language(value: str | None) -> str:
    normalized = (value or "ro").strip().lower()
    if normalized not in ALLOWED_LANGUAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported language.",
        )
    return normalized


def _normalize_theme(value: str | None) -> str:
    normalized = (value or "night").strip().lower()
    if normalized not in ALLOWED_THEMES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported theme.",
        )
    return normalized


def _load_user_with_settings(db: sqlite3.Connection, user_id: int) -> sqlite3.Row | None:
    return db.execute(
        """
        SELECT
            u.id,
            u.username,
            u.role,
            u.created_at,
            u.pin_hash,
            COALESCE(s.language, 'ro') AS language,
            COALESCE(s.theme, 'night') AS theme,
            s.updated_at AS updated_at
        FROM users u
        LEFT JOIN user_settings s ON s.user_id = u.id
        WHERE u.id = ?
        """,
        (user_id,),
    ).fetchone()


def _upsert_settings(
    db: sqlite3.Connection,
    user_id: int,
    language: str,
    theme: str,
) -> UserSettingsOut:
    db.execute(
        """
        INSERT INTO user_settings (user_id, language, theme, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
            language = excluded.language,
            theme = excluded.theme,
            updated_at = datetime('now')
        """,
        (user_id, language, theme),
    )
    row = db.execute(
        """
        SELECT language, theme, updated_at
        FROM user_settings
        WHERE user_id = ?
        """,
        (user_id,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist user settings.",
        )
    return UserSettingsOut(**dict(row))


def _require_admin(db: sqlite3.Connection, actor_id: int | None) -> sqlite3.Row:
    actor = _require_actor(db, actor_id)

    if actor["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can manage users.",
        )
    return actor


@router.get("/", response_model=list[UserOut])
def list_users(db: sqlite3.Connection = Depends(db_dep)) -> list[dict]:
    rows = db.execute(
        """
        SELECT id, username, role, created_at
        FROM users
        ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, username COLLATE NOCASE ASC
        """
    ).fetchall()
    return [dict(row) for row in rows]


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: sqlite3.Connection = Depends(db_dep),
    x_actor_id: int | None = Header(default=None, alias="X-Actor-Id"),
) -> dict:
    _require_admin(db, x_actor_id)

    username = payload.username.strip()
    if len(username) < 3 or len(username) > 32 or not USERNAME_PATTERN.fullmatch(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be 3-32 chars and can include only letters, numbers, ., _ and -.",
        )
    _validate_pin(payload.pin)

    try:
        cursor = db.execute(
            "INSERT INTO users (username, role, pin_hash) VALUES (?, ?, ?)",
            (username, payload.role, _hash_pin(payload.pin)),
        )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this username already exists.",
        ) from None

    _upsert_settings(db, cursor.lastrowid, "ro", "night")

    row = db.execute(
        "SELECT id, username, role, created_at FROM users WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load newly created user.",
        )
    return dict(row)


@router.post("/login", response_model=LoginResponse)
def login_user(
    payload: UserLogin,
    db: sqlite3.Connection = Depends(db_dep),
) -> LoginResponse:
    _validate_pin(payload.pin)
    row = _load_user_with_settings(db, payload.user_id)

    if row is None or row["pin_hash"] != _hash_pin(payload.pin):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user or PIN.",
        )

    language = _normalize_language(row["language"])
    theme = _normalize_theme(row["theme"])
    settings = _upsert_settings(db, row["id"], language, theme)

    user = UserOut(
        id=row["id"],
        username=row["username"],
        role=row["role"],
        created_at=row["created_at"],
    )
    return LoginResponse(user=user, settings=settings)


@router.get("/{user_id}/settings", response_model=UserSettingsOut)
def get_user_settings(
    user_id: int,
    db: sqlite3.Connection = Depends(db_dep),
    x_actor_id: int | None = Header(default=None, alias="X-Actor-Id"),
) -> UserSettingsOut:
    actor = _require_actor(db, x_actor_id)
    if actor["id"] != user_id and actor["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only read your own settings.",
        )

    user = db.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    row = _load_user_with_settings(db, user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    language = _normalize_language(row["language"])
    theme = _normalize_theme(row["theme"])
    return _upsert_settings(db, user_id, language, theme)


@router.put("/{user_id}/settings", response_model=UserSettingsOut)
def update_user_settings(
    user_id: int,
    payload: UserSettingsUpdate,
    db: sqlite3.Connection = Depends(db_dep),
    x_actor_id: int | None = Header(default=None, alias="X-Actor-Id"),
) -> UserSettingsOut:
    actor = _require_actor(db, x_actor_id)
    if actor["id"] != user_id and actor["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own settings.",
        )

    row = _load_user_with_settings(db, user_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    language = _normalize_language(payload.language if payload.language is not None else row["language"])
    theme = _normalize_theme(payload.theme if payload.theme is not None else row["theme"])
    return _upsert_settings(db, user_id, language, theme)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: sqlite3.Connection = Depends(db_dep),
    x_actor_id: int | None = Header(default=None, alias="X-Actor-Id"),
) -> Response:
    actor = _require_admin(db, x_actor_id)

    if actor["id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin users cannot delete themselves.",
        )

    target = db.execute(
        "SELECT id, role FROM users WHERE id = ?",
        (user_id,),
    ).fetchone()
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if target["role"] == "admin":
        admin_count = db.execute(
            "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'"
        ).fetchone()["total"]
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one admin user must remain.",
            )

    db.execute("DELETE FROM users WHERE id = ?", (user_id,))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
