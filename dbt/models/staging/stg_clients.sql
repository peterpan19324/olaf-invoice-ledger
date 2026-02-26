with source as (
    select * from {{ ref('raw_clients') }}
)

select
    client_id,
    trim(name)    as client_name,
    upper(country) as client_country
from source
