with invoices as (
    select * from {{ ref('stg_invoices') }}
),

payments as (
    select * from {{ ref('stg_payments') }}
),

payment_totals as (
    select
        invoice_id,
        sum(amount_paid) as total_paid,
        count(*)         as payment_count
    from payments
    group by invoice_id
)

select
    i.invoice_id,
    i.client_id,
    i.issue_date,
    i.due_date,
    i.amount,
    i.currency,
    i.status,
    coalesce(pt.total_paid,    0) as total_paid,
    coalesce(pt.payment_count, 0) as payment_count
from invoices i
left join payment_totals pt on i.invoice_id = pt.invoice_id
