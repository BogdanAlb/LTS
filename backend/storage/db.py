import sqlite3
from pathlib import Path
from contextlib import contextmanager
import hashlib
from typing import Generator, Optional

# Path to DB file (backend/storage/lts.db)
DB_PATH = Path(__file__).resolve().parent / "lts.db"

DEFAULT_ADMIN_PIN = "0000"
DEFAULT_PIN_HASH = hashlib.sha256(DEFAULT_ADMIN_PIN.encode("utf-8")).hexdigest()

USERS_SCHEMA_SQL = f"""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'restricted')),
    pin_hash TEXT NOT NULL DEFAULT '{DEFAULT_PIN_HASH}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""

USER_SETTINGS_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY,
    language TEXT NOT NULL DEFAULT 'ro',
    theme TEXT NOT NULL DEFAULT 'night',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

KIOSK_ORDER_SUBMISSIONS_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS kiosk_order_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    submitted_by TEXT,
    source_ip TEXT,
    fields_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
"""


def _apply_pragmas(conn: sqlite3.Connection) -> None:
    """Apply connection/database pragmas.

    Notes
    - journal_mode=WAL persists at the database level once set.
    - Keep per-connection pragmas like foreign_keys and busy_timeout here.
    """
    cur = conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL;")
    cur.execute("PRAGMA synchronous=NORMAL;")         # durability vs speed (WAL safe)
    cur.execute("PRAGMA foreign_keys=ON;")            # enforce FK
    cur.execute("PRAGMA busy_timeout=5000;")          # 5s wait on locks
    cur.execute("PRAGMA temp_store=MEMORY;")
    cur.execute("PRAGMA cache_size=-20000;")          # ~20MB page cache
    cur.execute("PRAGMA wal_autocheckpoint=1000;")    # checkpoint every ~1000 pages
    cur.close()

def _ensure_users_migration(conn: sqlite3.Connection) -> None:
    columns = {
        row[1]
        for row in conn.execute("PRAGMA table_info(users)").fetchall()
    }
    if "pin_hash" not in columns:
        conn.execute("ALTER TABLE users ADD COLUMN pin_hash TEXT")

    conn.execute(
        "UPDATE users SET pin_hash = ? WHERE pin_hash IS NULL OR trim(pin_hash) = ''",
        (DEFAULT_PIN_HASH,),
    )


def _ensure_user_settings(conn: sqlite3.Connection) -> None:
    conn.executescript(USER_SETTINGS_SCHEMA_SQL)
    conn.execute(
        """
        INSERT INTO user_settings (user_id, language, theme)
        SELECT id, 'ro', 'night'
        FROM users
        WHERE id NOT IN (SELECT user_id FROM user_settings)
        """
    )


def _ensure_admin_user(conn: sqlite3.Connection) -> None:
    conn.execute(
        """
        INSERT INTO users (username, role, pin_hash)
        SELECT 'admin', 'admin', ?
        WHERE NOT EXISTS (SELECT 1 FROM users)
        """,
        (DEFAULT_PIN_HASH,),
    )


def init_db(schema_sql: Optional[str] = None) -> None:
    """Ensure DB exists, enable WAL + pragmas, and optionally apply schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        _apply_pragmas(conn)
        conn.executescript(USERS_SCHEMA_SQL)
        conn.executescript(KIOSK_ORDER_SUBMISSIONS_SCHEMA_SQL)
        _ensure_users_migration(conn)
        _ensure_admin_user(conn)
        _ensure_user_settings(conn)
        if schema_sql:
            conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()


def connect() -> sqlite3.Connection:
    """Create a fresh connection with desired settings.

    FastAPI can execute sync dependencies/endpoints in different worker
    threads for the same request, so disable same-thread checks for request
    scoped connections.
    """
    conn = sqlite3.connect(
        DB_PATH,
        detect_types=sqlite3.PARSE_DECLTYPES,
        check_same_thread=False,
    )
    conn.row_factory = sqlite3.Row
    _apply_pragmas(conn)
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """FastAPI-friendly dependency as context manager.

    Usage:
        with get_db() as conn:
            conn.execute(...)
    or as a dependency in an endpoint:
        def endpoint(db: sqlite3.Connection = Depends(db_dep))
    """
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def db_dep() -> Generator[sqlite3.Connection, None, None]:
    """Dependency function suitable for FastAPI Depends()."""
    with get_db() as conn:
        yield conn
