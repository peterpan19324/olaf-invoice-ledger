import os
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

import duckdb

_DUCKDB_PATH = Path(os.getenv("DUCKDB_PATH", "../data/invoice_ledger.duckdb"))


def _resolved_path() -> Path:
    # Fails early with a clear message if the DuckDB file is missing.
    resolved = _DUCKDB_PATH.resolve()
    if not resolved.exists():
        raise FileNotFoundError(
            f"DuckDB database not found at '{resolved}'. "
            "Run 'dbt seed && dbt run' from the dbt/ directory first."
        )
    return resolved


@contextmanager
def get_connection() -> Generator[duckdb.DuckDBPyConnection, None, None]:
    # Opens a read-only connection so the API can never mutate the mart.
    conn = duckdb.connect(str(_resolved_path()), read_only=True)
    try:
        yield conn
    finally:
        conn.close()
