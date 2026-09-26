# Spec 1 — Filter semantics, stable sort, due-date validation

## Goal

Every filter pill returns a distinct, honest set; ordering is deterministic;
the form's due-date validation matches the backend.

## Commits (one git commit each, in order)

### Commit 1 — `fix(invoices): stable sort with id tie-breaker`

[`invoice.repository.ts`](../../backend/src/invoices/infra/repositories/invoice.repository.ts):

- `findByUserIdWithStatusFilter`: `order: { dueDate: 'DESC', id: 'DESC' }`.
- Apply the same `id: 'DESC` tie-breaker to the four
  `findPending*/findCompleted*` methods for consistent ordering everywhere.

### Commit 2 — `fix(frontend): sent pill shows only sent invoices`

[`InvoiceListPage.tsx:18-25`](../../frontend/src/pages/InvoiceListPage/InvoiceListPage.tsx):

- `sent` maps to `["sent"]` (was `["sent", "overdue"]`).
- `pending` stays `["sent", "overdue"]` — Pending remains "everything
  awaiting payment"; Sent becomes "sent and not yet overdue".

### Commit 3 — `fix(frontend): reject today's due date in the invoice form`

[`SendInvoicePage.tsx`](../../frontend/src/pages/SendInvoicePage/SendInvoicePage.tsx)
`validateForm()` (line ~78):

- `dueDate < today` → `dueDate <= today`; message becomes
  *"Due date must be in the future"* — matching the backend's strict rule
  (`create-invoice.transaction.script.ts:21`), so the form never promises a
  date the API rejects.

## Acceptance criteria

- With both sent and overdue invoices present: **Pending** shows both;
  **Sent** shows only the non-overdue ones; **Overdue** shows only the
  overdue ones. All three are distinct sets.
- Two invoices sharing a due date always render in the same order
  (higher `id` first) across refetches.
- Picking today's date in the invoice form shows the client-side error
  instead of a server error.

## Out of scope

- Text search (by debtor name, description, invoice number) — explicitly
  excluded from this feature.
- Client-side filtering of an already-fetched list (the backend filter is
  the single source of truth).

## Tests

- Backend: repo test — same-due-date invoices come back `id DESC`; filter
  semantics covered by the existing `fetch-invoices.action.spec.ts` patterns.
- Frontend: no test runner in the repo; verify manually via the acceptance
  criteria (seed one sent + one overdue invoice, compare the three pills).
