import sqlite3
from pathlib import Path
from contextlib import contextmanager
from typing import Generator, Optional

# Path to DB file (backend/storage/lts.db)
DB_PATH = Path(__file__).resolve().parent / "lts.db"


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


def init_db(schema_sql: Optional[str] = None) -> None:
    """Ensure DB exists, enable WAL + pragmas, and optionally apply schema."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        _apply_pragmas(conn)
        if schema_sql:
            conn.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()


def connect() -> sqlite3.Connection:
    """Create a fresh connection with desired settings.

    Thread-safety: create a new connection per request/task; do not share
    connections across threads. The default check_same_thread=True enforces
    same-thread usage which is safest for typical FastAPI sync endpoints.
    """
    conn = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
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
