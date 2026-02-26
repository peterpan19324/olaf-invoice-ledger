import { cn } from "@/lib/cn"
import type { InvoiceLedgerItem } from "@/types/invoice"

const CARD_CLASS = cn(
  "flex flex-col gap-1",
  "px-6 py-4 border-r border-slate-200 last:border-r-0",
)

const LABEL_CLASS = "text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-slate-400"
const VALUE_CLASS = "text-xl font-bold tabular-nums text-slate-800"

const LedgerSummary = ({ items }: { items: InvoiceLedgerItem[] }) => {
  const totalBilled      = items.reduce((s, i) => s + i.amount, 0)
  const totalCollected   = items.reduce((s, i) => s + i.total_paid, 0)
  const totalOutstanding = items.reduce((s, i) => s + Math.max(i.balance_due, 0), 0)
  const overdueCount     = items.filter((i) => i.invoice_status === "overdue").length

  return (
    <div className="grid grid-cols-5 border-b border-slate-200 bg-slate-50">
      <div className={CARD_CLASS}>
        <span className={LABEL_CLASS}>Invoices</span>
        <span className={VALUE_CLASS}>{items.length}</span>
      </div>
      <div className={CARD_CLASS}>
        <span className={LABEL_CLASS}>Total Billed</span>
        <span className={VALUE_CLASS}>
          {totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className={CARD_CLASS}>
        <span className={LABEL_CLASS}>Collected</span>
        <span className="text-xl font-bold tabular-nums text-green-600">
          {totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className={CARD_CLASS}>
        <span className={LABEL_CLASS}>Outstanding</span>
        <span className="text-xl font-bold tabular-nums text-amber-600">
          {totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className={CARD_CLASS}>
        <span className={LABEL_CLASS}>Overdue</span>
        <span className={cn(VALUE_CLASS, overdueCount > 0 && "text-red-600")}>
          {overdueCount}
        </span>
      </div>
    </div>
  )
}

export default LedgerSummary
