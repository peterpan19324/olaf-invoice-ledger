import { useEffect, useState } from "react"

import { cn } from "@/lib/cn"
import { fetchInvoices } from "@/api/invoices"
import type { InvoiceLedgerResponse } from "@/types/invoice"

import InvoiceRow from "@/components/InvoiceRow"
import LedgerSummary from "@/components/LedgerSummary"

const COLUMNS = [
  "Invoice",
  "Client",
  "Issued",
  "Due",
  "Amount",
  "Paid",
  "Balance Due",
  "Invoice Status",
  "Payment Status",
]

const InvoiceLedger = () => {
  const [response, setResponse] = useState<InvoiceLedgerResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
      .then(setResponse)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.")
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className={cn("flex items-baseline gap-4", "px-8 py-6 border-b border-slate-200")}>
        <h1 className="text-[1.375rem] font-bold tracking-tight text-slate-900">
          Invoice Ledger
        </h1>
        {response && (
          <p className="text-sm text-slate-400">
            {response.total} invoice{response.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading && (
        <div className="py-16 px-8 text-center text-[0.9375rem] text-slate-400">
          Loading invoices…
        </div>
      )}
      {error && (
        <div className="py-16 px-8 text-center text-[0.9375rem] text-red-600">
          {error}
        </div>
      )}

      {response && (
        <>
          <LedgerSummary items={response.data} />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className={cn(
                        "text-left bg-slate-50 whitespace-nowrap",
                        "px-4 py-3 border-b border-slate-200",
                        "text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-400",
                      )}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {response.data.map((item) => (
                  <InvoiceRow key={item.invoice_id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default InvoiceLedger
