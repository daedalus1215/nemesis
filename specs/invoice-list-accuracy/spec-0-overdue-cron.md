# Spec 0 — Overdue cron

## Goal

`sent` invoices whose due date has passed become `overdue`, automatically.

## Decisions

- Flip happens once a day (00:05) **and once on app boot**, so a deploy or a
  long downtime doesn't leave invoices un-flipped for a day.
- Only `sent` flips. `overdue`/`paid`/`cancelled`/`draft` are never touched.
- No per-invoice re-checks anywhere else; the stored status is the source of
  truth.

## Commits (one git commit each, in order)

### Commit 1 — `feat(invoices): mark overdue invoices`

- [`invoice.repository.ts`](../../backend/src/invoices/infra/repositories/invoice.repository.ts):
  add `markOverdue(): Promise<number>` —
  `UPDATE invoices SET status = 'overdue' WHERE status = 'sent' AND due_date < today`
  (today = local midnight, same convention as create); returns the affected
  row count.
- New `domain/transaction-scripts/mark-overdue-invoices-TS/` transaction
  script + `markOverdueInvoices()` on
  [`invoice.service.ts`](../../backend/src/invoices/domain/services/invoice.service.ts).

### Commit 2 — `feat(invoices): daily overdue scheduler`

- New `app/cron/overdue-invoice.scheduler.ts` in the invoices module,
  mirroring [`recurring-invoice.scheduler.ts`](../../backend/src/recurring-invoices/app/cron/recurring-invoice.scheduler.ts):
  `@Cron('5 0 * * *')` plus an `@OnModuleInit` run, logger, and try/catch so
  a failure only logs.
- Register the provider in
  [`invoices.module.ts`](../../backend/src/invoices/invoices.module.ts)
  (`ScheduleModule.forRoot()` is already registered app-wide by the
  recurring-invoices module — no module import needed).

## Acceptance criteria

- A `sent` invoice with a past due date is `overdue` after the next run; a
  `sent` invoice with a future due date is untouched.
- `draft`, `paid`, `cancelled`, and already-`overdue` invoices are never
  modified.
- Running twice is a no-op the second time (idempotent).
- Booting the app flips any overdue-but-unflipped invoices immediately.

## Out of scope

- Reminder/escalation behavior on overdue invoices.
- Sub-daily precision (an invoice flips within ~24h of its due date).

## Tests

- Mark-overdue TS/repo: sent+past flips; sent+future untouched; other
  statuses untouched; idempotent second run. Follow the existing
  `__specs__/*.spec.ts` convention.
