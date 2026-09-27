# Spec 2 — Due dates as local calendar days

## Problem

E2E of this feature exposed a fourth, deeper accuracy bug: **every invoice
stored its due date one day earlier than the date the user picked** (picker
`2026-10-15` → `due_date` `2026-10-14` in EDT), and the lapsed-draft send
check never fired.

Root cause: `new Date("YYYY-MM-DD")` is **UTC midnight** by spec. Two
consequences in any timezone behind UTC:

1. [`create-invoice.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/create-invoice-TS/create-invoice.transaction.script.ts)
   normalized that UTC-midnight `Date` with `setHours(0,0,0,0)` (local) and
   TypeORM serialized the `date` column from local components — landing on
   the **previous day**. The invoice list, the overdue cron, and the detail
   page all showed the shifted date.
2. The same UTC-midnight value compared against local-midnight `issueDate`
   made the "strictly future" rule reject the user's own *tomorrow*.

Separately, the `date` column **hydrates as a `'YYYY-MM-DD' string** at
runtime (the entity says `Date`, but the Postgres driver returns text), so
the send-time check `invoice.dueDate <= today` compared string vs `Date` —
which degrades to `NaN <= n` → always `false`. The lapsed-draft guard was
dead code.

The overdue cron had the same class of bug: it passed a local-midnight
`Date`, which Postgres compares as a *timestamp*; against a `date` column
that shifts the cutoff by the process/DB timezone offset (one day in this
deployment).

## Decisions

- **Unit of meaning is the local calendar day**, exactly what the picker
  emits and what the `date` column stores. All three comparison sites parse
  or pass `'YYYY-MM-DD'` local strings — no `Date` arithmetic on date-only
  values.
- Create: `new Date(y, m - 1, d, 0, 0, 0, 0)` (local midnight) — stores the
  picker's day verbatim and compares true local-midnight vs local-midnight.
- Send: calendar-day string comparison, handling both the string shape (the
  runtime reality) and `Date` (defensively).
- Overdue: the repository takes `before: string`; Postgres coerces the text
  parameter to `date`, so the comparison is day-for-day regardless of
  process/database timezone.
- Recurring-invoice generation is untouched: it already hands create-TS a
  `'YYYY-MM-DD'` string, which now round-trips verbatim.

## Commit (one git commit)

### `fix(invoices): parse and compare due dates as local calendar days`

- [`create-invoice.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/create-invoice-TS/create-invoice.transaction.script.ts)
- [`send-invoice.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/send-invoice-TS/send-invoice.transaction.script.ts)
- [`mark-overdue-invoices.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/mark-overdue-invoices-TS/mark-overdue-invoices.transaction.script.ts)
- [`invoice.repository.ts`](../../backend/src/invoices/infra/repositories/invoice.repository.ts) (`markOverdue(before: string)`)
- Specs: timezone-deterministic fixtures + regression tests (stored day,
  lapsed-string rejection, string boundary).

## Acceptance criteria

- Picking tomorrow stores tomorrow (verified: picked `2026-09-27` →
  `due_date` `2026-09-27`, API-confirmed).
- Picking today or a past day is rejected client- and server-side.
- A draft whose due date has lapsed cannot be sent (verified live with a
  backdated draft — still `draft` after the send attempt).
- A `sent` invoice with a past due date flips to `overdue` on the next
  cron/boot run; `draft`/`paid`/`cancelled` rows are never touched
  (verified live: sent row flipped, backdated draft untouched).

## Tests

- create-TS: the stored `Date`'s local calendar day equals the dto's
  `YYYY-MM-DD` (the regression that catches the off-by-one in any TZ).
- send-TS: string-shaped `dueDate` — lapsed rejects, future sends.
- mark-overdue-TS: boundary is today's local `'YYYY-MM-DD'` string.
