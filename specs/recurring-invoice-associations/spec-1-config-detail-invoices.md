# Spec 1 — Invoices on the recurring-config detail page

**The original request.** Built together with [Spec 0](./spec-0-foundation.md).
Lets a user see every invoice a recurring config has generated.

## Depends on

- Spec 0 (the `recurring_invoice_id` column must exist and be populated).

## Backend changes

### Repository
[`invoice.repository.ts`](../../backend/src/invoices/infra/repositories/invoice.repository.ts)
- New method `findByRecurringInvoiceId(recurringInvoiceId: number): Promise<Invoice[]>`,
  ordered `issueDate DESC`.

### Action
- New action `GET /recurring-invoices/:id/invoices`, in the recurring-invoices
  module, mirroring the existing action structure
  (action → transaction-script → repository).
- Auth: caller must be the config's `issuerUserId`; otherwise 403.
- Returns the same `Invoice` shape the invoices list already uses.

## Frontend changes

### Hook
- New `useFetchInvoicesForRecurring(id)`, mirroring
  [`useFetchInvoices.ts`](../../frontend/src/pages/InvoiceListPage/useFetchInvoices.ts).

### UI
[`RecurringInvoiceDetailPage.tsx`](../../frontend/src/pages/RecurringInvoiceDetailPage/RecurringInvoiceDetailPage.tsx)
- New "Generated invoices" section listing each invoice (id, amount, status,
  issue/due date).
- Each row links to the invoice detail page.
- Empty state: "No invoices generated yet."

## Acceptance criteria

- Config detail shows all invoices it generated, newest first.
- Clicking a row opens that invoice's detail page.
- A config that has not run yet shows the empty state.
- Requesting another user's config's invoices is rejected (403).

## Tests

- Action test: owner gets the config's invoices; non-owner gets 403.
- Repository test: returns only invoices with the matching
  `recurringInvoiceId`, ordered newest first.
