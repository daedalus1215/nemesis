# Spec 1 — Frontend: save-as-draft, send on detail, pay guard

**Depends on Spec 0.**

## Goal

The user creates a draft from the invoice form, sends it later from the
detail page, and never sees a Pay button on a draft.

## Commits (one git commit each, in order)

### Commit 1 — `feat(frontend): save-as-draft button on the invoice form`

[`SendInvoicePage.tsx`](../../frontend/src/pages/SendInvoicePage/SendInvoicePage.tsx):

- Add a secondary **"Save as Draft"** button beside the primary submit;
  both run the same `validateForm()`.
- Draft submit posts `{ ..., send: false }` to `/invoices`; success message
  reads *"Draft saved — send it from its detail page."* (vs. today's
  *"Invoice sent successfully!"*).
- Form resets on either success; no new route or state.

### Commit 2 — `feat(frontend): send action + pay guard on the invoice detail`

[`InvoiceDetailPage.tsx`](../../frontend/src/pages/InvoiceDetailPage/InvoiceDetailPage.tsx):

- `canSend = isIssuer && invoice.status === "draft"` → **Send Invoice**
  button calling `POST /invoices/:id/send`; refetch on success (existing
  refetch pattern); surface the backend message on error (covers the
  lapsed-due-date rejection).
- `canPay` (line 63) gains
  `["sent", "overdue"].includes(invoice.status)` — today a debtor could pay a
  draft in the UI; the backend now rejects it, but the UI must not offer it.

The invoice list page needs **no changes**: the "Draft" pill, the
`statusDraft` style, and the empty-state message already exist and become
real once drafts can be created.

## Acceptance criteria

- Save as draft → invoice appears under the **Draft** pill on the list; the
  detail page shows *Draft* status, a Send button for the issuer, and no Pay
  button for the debtor.
- Send from the detail page → status becomes *Sent*; Pay becomes available to
  the debtor.
- Draft whose due date has lapsed → clicking Send shows the backend error
  message; status unchanged.

## Out of scope

- Editing a draft's fields (debtor, amount, dates).
- Drafts from recurring configs (locked: recurring always sends).

## Tests

- The frontend has no test runner today (no vitest/jest in
  `package.json`); verify manually via the acceptance criteria. Backend
  behavior is covered by Spec 0 tests.
