with source as (
    select * from {{ ref('raw_invoices') }}
)

select
    invoice_id,
    client_id,
    cast(issue_date as date)  as issue_date,
    cast(due_date   as date)  as due_date,
    cast(amount     as double) as amount,
    upper(trim(currency))     as currency,
    lower(trim(status))       as status
from source
