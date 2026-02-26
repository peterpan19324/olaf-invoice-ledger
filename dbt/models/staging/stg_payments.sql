with source as (
    select * from {{ ref('raw_payments') }}
)

select
    payment_id,
    invoice_id,
    cast(paid_at     as timestamp) as paid_at,
    cast(amount_paid as double)    as amount_paid
from source
