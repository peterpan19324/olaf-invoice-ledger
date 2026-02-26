from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.v1 import invoices

app = FastAPI(
    title="Invoice Ledger API",
    version="1.0.0",
    description="Serves the processed invoice ledger mart as a versioned, typed contract.",
)

# Allows Vite dev/preview ports and the Docker frontend service.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "http://frontend:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(invoices.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict:
    # Confirms the API is reachable for health checks.
    return {"status": "ok"}
