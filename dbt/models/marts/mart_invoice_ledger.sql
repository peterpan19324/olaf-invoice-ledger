with invoice_payments as (
    select * from {{ ref('int_invoice_payments') }}
),

clients as (
    select * from {{ ref('stg_clients') }}
),

final as (
    select
        ip.invoice_id,
        c.client_name,
        c.client_country,
        ip.issue_date,
        ip.due_date,
        ip.amount,
        ip.currency,
        ip.status                 as invoice_status,
        ip.total_paid,
        ip.payment_count,
        ip.amount - ip.total_paid as balance_due,
        case
            when ip.total_paid >= ip.amount then 'paid'
            when ip.total_paid > 0          then 'partial'
            else                                 'unpaid'
        end                       as payment_status
    from invoice_payments ip
    left join clients c on ip.client_id = c.client_id
)

select * from final
