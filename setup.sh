#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

log()     { echo "==> $1"; }
success() { echo "    ✓ $1"; }

log "Setting up Invoice Ledger..."

log "[1/3] Running dbt transformations..."

mkdir -p data
PYTHON=$(command -v python || command -v python3)
"$PYTHON" -m venv .venv
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate

pip install --quiet "dbt-duckdb>=1.9.0"

cd dbt
dbt seed --profiles-dir .
dbt run  --profiles-dir .
dbt test --profiles-dir . || echo "    [!] Some tests failed — review output above."
cd "$REPO_ROOT"

success "DuckDB written to data/invoice_ledger.duckdb"

log "[2/3] Starting FastAPI backend..."

pip install --quiet -r backend/requirements.txt

(
  cd backend
  DUCKDB_PATH="../data/invoice_ledger.duckdb" \
    uvicorn app.main:app --port 8000 --reload
) &
BACKEND_PID=$!
sleep 2

success "Backend running at http://localhost:8000 (PID $BACKEND_PID)"

log "[3/3] Starting React frontend..."

(
  cd frontend
  npm install --silent
  npm run dev
) &
FRONTEND_PID=$!
sleep 3

success "Frontend running at http://localhost:5173 (PID $FRONTEND_PID)"

echo ""
echo "========================================"
echo "  Invoice Ledger is running!"
echo ""
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services."

trap 'echo ""; log "Shutting down..."; kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null; exit 0' INT TERM
wait
