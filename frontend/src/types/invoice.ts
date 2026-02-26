export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'paid' | 'partial' | 'unpaid'

export interface InvoiceLedgerItem {
  invoice_id: string
  client_name: string
  client_country: string
  issue_date: string
  due_date: string
  amount: number
  currency: string
  invoice_status: InvoiceStatus
  total_paid: number
  payment_count: number
  balance_due: number
  payment_status: PaymentStatus
}

export interface InvoiceLedgerResponse {
  data: InvoiceLedgerItem[]
  total: number
}
