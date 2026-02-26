from datetime import date

from pydantic import BaseModel


class InvoiceLedgerItem(BaseModel):
    invoice_id: str
    client_name: str
    client_country: str
    issue_date: date
    due_date: date
    amount: float
    currency: str
    invoice_status: str
    total_paid: float
    payment_count: int
    balance_due: float
    payment_status: str


class InvoiceLedgerResponse(BaseModel):
    data: list[InvoiceLedgerItem]
    total: int
