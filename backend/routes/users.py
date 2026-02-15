import re
import sqlite3
from typing import Literal

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from pydantic import BaseModel, Field

from storage.db import db_dep

router = APIRouter(tags=["users"])

USERNAME_PATTERN = re.compile(r"^[A-Za-z0-9._-]+$")


class UserOut(BaseModel):
    id: int
    username: str
    role: Literal["admin", "restricted"]
    created_at: str


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    role: Literal["admin", "restricted"] = "restricted"


def _require_admin(db: sqlite3.Connection, actor_id: int | None) -> sqlite3.Row:
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

    try:
        cursor = db.execute(
            "INSERT INTO users (username, role) VALUES (?, ?)",
            (username, payload.role),
        )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this username already exists.",
        ) from None

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
