import { cn } from "@/lib/cn"
import { formatAmount, formatDate } from "@/lib/utils"
import type { InvoiceLedgerItem, InvoiceStatus, PaymentStatus } from "@/types/invoice"

const INVOICE_STATUS_CLASS: Record<InvoiceStatus, string> = {
  draft:     "bg-slate-100 text-slate-500",
  sent:      "bg-blue-100 text-blue-700",
  paid:      "bg-green-100 text-green-700",
  overdue:   "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
}

const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  paid:    "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-amber-800",
  unpaid:  "bg-orange-50 text-orange-700",
}

const TD = "px-4 py-3 text-sm align-middle text-slate-700 group-hover:bg-slate-50"

const BADGE = cn(
  "inline-flex items-center capitalize",
  "px-2.5 py-0.5 rounded-full",
  "text-xs font-medium whitespace-nowrap",
)

const InvoiceRow = ({ item }: { item: InvoiceLedgerItem }) => (
  <tr className="group">
    <td className={cn(TD, "font-mono text-[0.8125rem] text-slate-500")}>
      {item.invoice_id}
    </td>
    <td className={TD}>
      <div className="font-medium text-slate-800">{item.client_name}</div>
      <div className="mt-0.5 text-xs text-slate-400">{item.client_country}</div>
    </td>
    <td className={TD}>{formatDate(item.issue_date)}</td>
    <td className={TD}>{formatDate(item.due_date)}</td>
    <td className={cn(TD, "tabular-nums text-right whitespace-nowrap")}>
      {formatAmount(item.amount, item.currency)}
    </td>
    <td className={cn(TD, "tabular-nums text-right whitespace-nowrap")}>
      {formatAmount(item.total_paid, item.currency)}
    </td>
    <td className={cn(TD, "tabular-nums text-right whitespace-nowrap", item.balance_due > 0 && "font-medium text-amber-700")}>
      {formatAmount(Math.max(item.balance_due, 0), item.currency)}
    </td>
    <td className={TD}>
      <span className={cn(BADGE, INVOICE_STATUS_CLASS[item.invoice_status])}>
        {item.invoice_status}
      </span>
    </td>
    <td className={TD}>
      <span className={cn(BADGE, PAYMENT_STATUS_CLASS[item.payment_status])}>
        {item.payment_status}
      </span>
    </td>
  </tr>
)

export default InvoiceRow
