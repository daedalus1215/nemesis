# Spec 3 — Filter the main invoices list by config

**Follow-up.** Filter the whole invoices area down to a single recurring
config, and tie the three features together.

## Depends on

- Spec 0 (the `recurring_invoice_id` column must exist and be populated).

## Backend changes

- Add an optional `recurringInvoiceId` query param to `GET /invoices`
  ([`fetch-invoices.request.dto.ts`](../../backend/src/invoices/app/actions/fetch-invoices-action/fetch-invoices.request.dto.ts)).
- When present, `findByUserIdWithStatusFilter`
  ([`invoice.repository.ts`](../../backend/src/invoices/infra/repositories/invoice.repository.ts))
  adds `recurringInvoiceId` to **both** the issuer and debtor where-branches.
- Composable with the existing `statuses` filter.

## Frontend changes

- [`InvoiceListPage.tsx`](../../frontend/src/pages/InvoiceListPage/InvoiceListPage.tsx)
  reads `recurringInvoiceId` from the URL query and passes it to
  `useFetchInvoices`.
- When set, show a "Filtered by schedule REC-… ✕" chip that clears back to the
  full list.
- Spec 1's detail page gets a "View all in invoices" link →
  `/invoices?recurringInvoiceId=:id`.

## Acceptance criteria

- `/invoices?recurringInvoiceId=5` shows only that config's invoices.
- Combines correctly with status filters.
- The filter chip clears back to the full list.

## Tests

- Repository test: `recurringInvoiceId` filter restricts results and composes
  with `statuses`.
- DTO test: the param is optional and validated.
