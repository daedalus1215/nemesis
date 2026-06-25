# Spec 0 — Foundation: link generated invoices to their config

**Ships together with Spec 1.** This is the actual bug fix; the read features
are meaningless without it.

## Goal

Every invoice created by a recurring config records which config produced it.
Manually-created invoices leave the field null.

## Decisions

- Link is the numeric `recurring_invoices.id`.
- Going-forward only — no data migration of existing rows.

## Backend changes

### Migration
`backend/src/typeorm/migrations/`
- `ALTER TABLE invoices ADD COLUMN recurring_invoice_id integer NULL`.
- FK: `recurring_invoice_id → recurring_invoices(id) ON DELETE SET NULL`.
- Index `recurring_invoice_id` (queried by all three features).
- No backfill.

### Entity
[`invoice.entity.ts`](../../backend/src/invoices/domain/entities/invoice.entity.ts)
```ts
@Column({ name: 'recurring_invoice_id', type: 'int', nullable: true })
recurringInvoiceId?: number;
```

### Create path
- Thread an optional `recurringInvoiceId` from
  [`create-invoice.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/create-invoice-TS/create-invoice.transaction.script.ts)
  into `invoiceRepository.create(...)`.
- `invoiceService.createInvoice` accepts the field as an internal parameter.
- The public `POST /invoices` request DTO is **not** changed — the field is set
  internally only, never by external callers.

### Stamp it
[`recurring-invoice.aggregator.ts:55-65`](../../backend/src/recurring-invoices/domain/aggregators/recurring-invoice.aggregator.ts)
`createInvoiceFromRecurring` passes `recurringInvoiceId: recurringInvoice.id`
into the invoice creation call.

## Acceptance criteria

- A recurring run creates an invoice whose `recurring_invoice_id` equals the
  config's `id` — on run #1 **and** every subsequent run.
- A normal "Send Invoice" leaves `recurring_invoice_id` null.
- Existing invoices are unaffected (remain null).

## Out of scope

- No UI.
- No new read endpoints (those are Specs 1–3).

## Tests

- Transaction-script test: invoice created via recurring path carries the id.
- Transaction-script test: invoice created via normal path leaves it null.
