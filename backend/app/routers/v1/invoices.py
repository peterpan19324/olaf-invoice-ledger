from fastapi import APIRouter, HTTPException

from app.db import get_connection
from app.schemas.invoice import InvoiceLedgerItem, InvoiceLedgerResponse

router = APIRouter(prefix="/invoices", tags=["invoices"])

# Selects columns by name so mart changes don't silently alter the response.
_QUERY = """
SELECT
    invoice_id,
    client_name,
    client_country,
    issue_date,
    due_date,
    amount,
    currency,
    invoice_status,
    total_paid,
    payment_count,
    balance_due,
    payment_status
FROM marts.mart_invoice_ledger
ORDER BY issue_date DESC
"""


@router.get("", response_model=InvoiceLedgerResponse)
def list_invoices() -> InvoiceLedgerResponse:
    # Validates each row against the Pydantic contract; failures point to dbt.
    try:
        with get_connection() as conn:
            conn.execute(_QUERY)
            columns = [col[0] for col in conn.description]
            rows = conn.fetchall()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    items = [
        InvoiceLedgerItem(**dict(zip(columns, row)))
        for row in rows
    ]
    return InvoiceLedgerResponse(data=items, total=len(items))
