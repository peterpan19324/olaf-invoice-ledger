FROM python:3.12-slim

WORKDIR /dbt

RUN pip install --no-cache-dir "dbt-duckdb>=1.9.0"

COPY . .

# Run seed then run. Both commands are idempotent: seed replaces rows,
# table-materialized models drop and recreate on every invocation.
CMD ["sh", "-c", "dbt seed --profiles-dir . && dbt run --profiles-dir ."]
