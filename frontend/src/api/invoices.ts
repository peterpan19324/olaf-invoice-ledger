import type { InvoiceLedgerResponse } from '@/types/invoice'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export const fetchInvoices = async (): Promise<InvoiceLedgerResponse> => {
  const response = await fetch(`${BASE_URL}/api/v1/invoices`)

  if (!response.ok) {
    throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<InvoiceLedgerResponse>
}
