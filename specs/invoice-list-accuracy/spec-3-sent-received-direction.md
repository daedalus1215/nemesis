# Spec 3 — Direction-based Sent/Received filters

## Goal

The filter pills distinguish *who I am on the invoice* (issuer vs debtor),
not just *what state the invoice is in*. "Sent" must show only invoices the
current user issued; a new "Received" pill shows only invoices issued to the
current user.

## Background

Spec 1 locked "Sent = `sent` status only" to make the pills return distinct
sets. In use it still felt wrong: an invoice the user *received* also has
status `sent` (the issuer sent it), so the Sent pill listed invoices the
user had to pay. The data model already carries direction —
`issuer_user_id` / `debtor_user_id` on every invoice — so direction belongs
in the filter.

## Decisions (locked, user-confirmed 2026-09-26)

- **Sent** = invoices where I am the **issuer**, status ∈
  {`sent`, `overdue`, `paid`, `cancelled`} — "all of the ones I sent out",
  full history. Drafts I created stay only on the Draft pill.
- **Received** (new pill) = invoices where I am the **debtor**, same status
  set — symmetric history of what was sent to me.
- **Pending** = `sent` + `overdue`, **both directions** — unchanged
  ("everything awaiting payment: what I sent out awaiting payment + what I
  received I owe").
- **All / Draft / Paid / Overdue / Cancelled** — unchanged (All = both
  directions, every status; the rest are status filters across both
  directions).
- This supersedes Spec 1's "Sent = `sent` only" decision.

## Commits (one git commit each, in order)

### Commit 1 — `feat(invoices): direction param on GET /invoices`

- [`invoice.entity.ts`](../../backend/src/invoices/domain/entities/invoice.entity.ts):
  `INVOICE_DIRECTION = { ISSUED: 'issued', RECEIVED: 'received' }` +
  `InvoiceDirectionType`.
- [`fetch-invoices.request.dto.ts`](../../backend/src/invoices/app/actions/fetch-invoices-action/fetch-invoices.request.dto.ts):
  optional `direction` — `@IsOptional()` + `@IsEnum(INVOICE_DIRECTION)`
  (single string value, no transform needed).
- [`fetch-invoices.action.ts`](../../backend/src/invoices/app/actions/fetch-invoices-action/fetch-invoices.action.ts):
  pass `query.direction` to the service.
- [`invoice.service.ts`](../../backend/src/invoices/domain/services/invoice.service.ts):
  `getInvoices(userId, statuses?, direction?)`.
- [`fetch-invoices.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/fetch-invoices-TS/fetch-invoices.transaction.script.ts):
  pass-through.
- [`invoice.repository.ts`](../../backend/src/invoices/infra/repositories/invoice.repository.ts)
  `findByUserIdWithStatusFilter(userId, statuses?, direction?)`:
  - omitted → current both-directions OR (unchanged)
  - `'issued'` → issuer branch only
  - `'received'` → debtor branch only
  - status filter and `dueDate DESC, id DESC` order unchanged

### Commit 2 — `feat(frontend): Sent/Received direction pills`

- [`InvoiceListPage.tsx`](../../frontend/src/pages/InvoiceListPage/InvoiceListPage.tsx):
  - filter type gains `"received"`; pill row:
    `["pending","all","draft","sent","received","paid","overdue","cancelled"]`
  - mapping: `sent` → statuses `["sent","overdue","paid","cancelled"]` +
    direction `"issued"`; `received` → same statuses + direction
    `"received"`; everything else unchanged.
- [`useFetchInvoices.ts`](../../frontend/src/pages/InvoiceListPage/useFetchInvoices.ts):
  second param `direction?: string`, included in the query params and in
  the fetch key.

## Acceptance criteria

- A issues a sent invoice to B. **A's Sent** shows it; **A's Received**
  does not. **B's Received** shows it; **B's Sent** does not. It appears on
  both users' **Pending** and **All**.
- A paid invoice A issued appears on A's **Sent** and **Paid** pills.
- A draft A created appears only on A's **Draft** and **All**.
- Pending/All/Draft/Paid/Overdue/Cancelled behavior is unchanged from today.

## Out of scope

- Text search (already excluded by the feature scope).
- A direction param on other endpoints (the Money page's pending lists are
  already direction-specific by construction).

## Tests

- [`fetch-invoices.action.spec.ts`](../../backend/src/invoices/app/actions/fetch-invoices-action/__specs__/fetch-invoices.action.spec.ts):
  query with `direction` reaches `getInvoices(userId, statuses, direction)`.
- [`invoice.service.spec.ts`](../../backend/src/invoices/domain/services/__specs__/invoice.service.spec.ts):
  `getInvoices` forwards `direction` to the transaction script.
- E2E on dev with two users, per the acceptance criteria.
