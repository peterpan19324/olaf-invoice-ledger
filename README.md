# Invoice Ledger

A walking skeleton for an invoice ledger feature — dbt + DuckDB for data, FastAPI for the API contract, React/TypeScript for the UI. Everything runs locally, no external services required.

---

## Running it

### Local (bash)

```bash
bash setup.sh
```

Needs Python 3.11+ and Node 18+. Creates a venv, runs dbt, starts the backend and the Vite dev server.

|          | URL                        |
| -------- | -------------------------- |
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:8000      |
| Swagger  | http://localhost:8000/docs |

### Docker Compose

```bash
docker compose up --build
```

The compose file enforces order: dbt runs and exits first, then the backend starts, then the frontend. They share a named volume for the DuckDB file.

---

## Data lineage

```
seeds (CSV)
├── raw.raw_invoices
├── raw.raw_clients
└── raw.raw_payments
        │
        ▼  staging — type casting and column renames only
├── staging.stg_invoices
├── staging.stg_clients
└── staging.stg_payments
        │
        ▼  intermediate — payment aggregation per invoice
└── intermediate.int_invoice_payments
        │
        ▼  marts — the only thing the API is allowed to read
└── marts.mart_invoice_ledger
        │
        ▼
   GET /api/v1/invoices
        │
        ▼
   <InvoiceLedger />
```

Data flows one direction. Nothing reads from a layer above it.

---

## Why the boundaries are where they are

### dbt owns the business logic

The two fields that actually mean something — `balance_due` and `payment_status` — are computed in `mart_invoice_ledger.sql` and nowhere else.

I initially considered deriving `payment_status` in FastAPI since it's just a CASE expression and felt trivial. The problem is that a second consumer (say, a webhook or a scheduled report) would have to re-derive it independently, and over time those implementations drift. Putting it in the mart means it's computed once, tested once, and every consumer gets the same answer automatically.

`balance_due` follows the same logic. It's `amount - total_paid`, which sounds simple — but "simple" is exactly when logic tends to get duplicated without anyone noticing.

### The intermediate layer

The intermediate model (`int_invoice_payments`) aggregates payments per invoice before the mart join. At this data volume it's technically unnecessary — the mart could do it inline. I kept it separate for two reasons: it makes the aggregation independently testable, and it keeps the mart readable. If I collapsed it into the mart, the mart SQL would mix aggregation and labelling logic in one query, which makes both harder to change later.

### The mart is the public contract

Staging and intermediate models are internal. Their schema can change freely as long as the mart output stays the same. The mart is the only thing the API depends on, so it's the only thing where a column rename is a breaking change.

### FastAPI does only serialisation

The router reads from the mart, validates each row against the Pydantic schema, and returns the envelope. No filtering, no reshaping, no logic. If Pydantic raises a validation error, the problem is in dbt — the mart schema drifted from the contract. The fix belongs there.

One thing I deliberately left out: there's no startup check that validates the live mart schema against the Pydantic model. That would be the right thing to add in a real service — fail loudly at boot rather than at the first request. I skipped it to keep the skeleton focused.

### React does only rendering

The component receives typed data and renders it. The summary bar sums amounts across rows, which is presentation logic (the values are already there, we're just aggregating them for display), not business logic. No new semantic fields are derived in the frontend.

The TypeScript types in `src/types/invoice.ts` mirror the Pydantic schema field-for-field. If the backend contract changes, the type mismatch surfaces as a compile error before anything ships.

---

## Idempotency

| Layer                  | Why running it twice produces the same result                                   |
| ---------------------- | ------------------------------------------------------------------------------- |
| `dbt seed`             | Truncates and reloads seed tables on every run                                  |
| Staging / intermediate | Materialised as views — re-running recreates the definition, no rows are stored |
| Marts                  | Materialised as a table — dbt drops and recreates it on every run               |
| Backend                | Read-only — no writes, no state changes                                         |
| Frontend               | Stateless fetch — every page load re-fetches from scratch                       |

---

## No hidden side effects

- **No triggers.** Nothing happens unless dbt explicitly runs.
- **No stored procedures.** All logic is in version-controlled `.sql` files.
- **Read-only API.** `duckdb.connect(..., read_only=True)` makes it physically impossible for the backend to write to the mart.
- **Explicit column selection.** The query names every column. Adding a field to the mart doesn't change the API response until the query and Pydantic schema are updated deliberately.
- **No implicit reshaping.** What dbt writes is what the API reads is what the browser shows.

---

## Seed data edge cases

The mock data is intentionally messy to exercise the full pipeline:

- **4-payment chain** — INV-010 (45,000 SEK) is settled across four transactions over three weeks. Tests `SUM` aggregation and `payment_count = 4`.
- **3-payment chain** — INV-001 (15,750 USD) and INV-029 (11,200 USD) both use three instalments. Different clients, different currencies.
- **Split payment** — INV-016 (12,400 AUD) split across two payments. Tests `payment_count = 2` resolves to `paid`.
- **Overpayment** — INV-014 (4,800 JPY) received 5,100 JPY. `balance_due` goes negative; the frontend clamps it to zero with `Math.max`. `payment_status` is still `paid` since `total_paid >= amount`.
- **Partial on an overdue invoice** — INV-007 (8,750 GBP) and INV-027 (32,100 EUR) each have one partial payment. Both should show `payment_status = partial`.
- **Tiny partial** — INV-020 (4,100 EUR) has a 500 EUR payment against a 4,100 EUR invoice — about 12% collected. Tests that small partials don't round to zero.
- **Cancelled with prior payment** — INV-025 (8,200 SGD) was partially paid (3,000 SGD) before being cancelled. The mart has no special logic for this: `payment_status = partial`, `invoice_status = cancelled`. Both are true simultaneously, which is correct.
- **Zero-amount draft** — INV-022 (0.00 EUR) is a placeholder draft with no amount set. `total_paid = 0 >= amount = 0` so `payment_status` resolves to `paid`. That's technically accurate — nothing is owed — but it's a quirk worth knowing about.
- **Dirty client name** — C010 arrives as `" Vertex Solutions "` with leading and trailing spaces. `stg_clients` strips it with `trim()`.
- **Dirty country code** — C004 arrives as lowercase `jp`. `stg_clients` normalises it with `upper()`. Both cases are why the staging layer exists: raw source data is not trustworthy.
- **8 currencies** — USD, GBP, SEK, JPY, AUD, EUR, CAD, SGD. The mart carries currency through as-is; no conversion is attempted.

---

## Project structure

```
├── dbt/
│   ├── seeds/           raw CSV data
│   ├── models/
│   │   ├── staging/     type casts and renames
│   │   ├── intermediate/ payment aggregation
│   │   └── marts/       public contract, all business rules
│   ├── macros/          schema name override
│   ├── dbt_project.yml
│   └── profiles.yml
├── backend/
│   └── app/
│       ├── main.py      FastAPI app + CORS
│       ├── db.py        read-only DuckDB connection
│       ├── schemas/     Pydantic contract
│       └── routers/v1/  GET /api/v1/invoices
├── frontend/
│   └── src/
│       ├── types/       TypeScript mirror of the Pydantic schema
│       ├── api/         fetch wrapper
│       └── components/  InvoiceLedger UI
├── docker-compose.yml
├── setup.sh
└── README.md
```

---

## Running dbt manually

```bash
cd dbt

dbt seed  --profiles-dir .   # load CSVs into raw schema
dbt run   --profiles-dir .   # build staging → intermediate → mart
dbt test  --profiles-dir .   # run schema tests
```

## Environment variables

| Variable      | Default                         | Used by             |
| ------------- | ------------------------------- | ------------------- |
| `DUCKDB_PATH` | `../data/invoice_ledger.duckdb` | dbt, backend        |
| `BACKEND_URL` | `http://localhost:8000`         | Vite proxy (Docker) |
