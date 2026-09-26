# Invoice list accuracy (status filter fixes)

**Problem.** The invoice list "search" (the status-filter pill row) is
inaccurate in three ways:

1. **"Pending" and "Sent" return the identical list** — both map to
   `sent,overdue` in
   [`InvoiceListPage.tsx:18-25`](../../frontend/src/pages/InvoiceListPage/InvoiceListPage.tsx).
2. **"Overdue" can never match anything** — no code ever sets `OVERDUE`, even
   though the enum, the repo queries, the status styles, and the pill all
   assume it.
3. **Sort is unstable** — `dueDate DESC` with no tie-breaker, so invoices
   sharing a due date come back in an unspecified order
   ([`invoice.repository.ts:72`](../../backend/src/invoices/infra/repositories/invoice.repository.ts)).

Also found while reviewing: the invoice form lets you pick **today** as the
due date ("Due date must be today or in the future") while the backend
rejects anything not strictly in the future — a validation mismatch.

And a fourth, deeper bug found during E2E: **due dates were stored one day
early** — `new Date("YYYY-MM-DD")` is UTC midnight, which serializes to the
previous local day's `date` column in timezones behind UTC. See
[Spec 2](./spec-2-due-date-timezone.md).

## Decisions (locked)

- **Scope:** fix the status filter only. A text search (by name/description)
  is **out of scope**.
- **Overdue source:** a cron marks `sent` invoices with a past due date as
  `overdue` — once a day and on app boot. This matches the obvious original
  intent of the code.
- **Pill semantics:** Pending = `sent` + `overdue` (everything awaiting
  payment — unchanged); **Sent = `sent` only**; Overdue = past due date.
- **Sort:** `dueDate DESC, id DESC` — deterministic, newest first on ties.
- **Due-date validation:** the frontend is aligned to the backend's strict
  rule (today is rejected).
- **Date unit:** the local calendar day (`'YYYY-MM-DD'`) is the unit of
  meaning for every due-date comparison — never `Date` arithmetic on
  date-only values (see Spec 2).

## Specs

| # | Spec | Depends on | Status |
|---|------|-----------|--------|
| 0 | [Overdue cron](./spec-0-overdue-cron.md) | — | Done |
| 1 | [Filter semantics, stable sort, due-date validation](./spec-1-filter-semantics-sort.md) | Spec 0 (for the Sent/Pending distinction to be visible) | Done |
| 2 | [Due dates as local calendar days](./spec-2-due-date-timezone.md) | — | Done |

## Shared notes

- **Money page:** `findPendingByDebtorUserId` already queries
  `sent + overdue` — it gains overdue items for free once the cron exists.
  No change needed.
- **Commit discipline:** small commits only — each numbered commit in the
  spec files is exactly one git commit.

## Tech stack

- Backend: NestJS + TypeORM + Postgres; `@nestjs/schedule` is already
  registered (see the recurring-invoices module).
- Frontend: React + Vite.
