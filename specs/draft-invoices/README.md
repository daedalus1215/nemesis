# Draft invoices

**Problem.** Every invoice is created as *sent*:
[`create-invoice.transaction.script.ts:35`](../../backend/src/invoices/domain/transaction-scripts/create-invoice-TS/create-invoice.transaction.script.ts)
hardcodes `INVOICE_STATUS.SENT`. The `draft` status already exists in the
entity enum, the invoice list renders a "Draft" filter pill, and the detail
page has a `statusDraft` style — but a draft can never exist. There is no way
to create an invoice without sending it, and no way to send one later.

## Decisions (locked)

- **Entry point:** two submit buttons on the existing send-invoice page —
  *Send Invoice* (primary) + *Save as Draft* (secondary). No new page or
  route.
- **State machine:**
  - `draft → sent` only via an explicit **Send** action (issuer only), which
    re-validates the due date is still in the future at send time. If it has
    passed, sending is rejected (cancel the draft, create a new one).
  - `draft → cancelled` allowed (issuer, like today's other statuses).
  - Drafts are **never payable**.
- **Recurring configs** always generate `sent` invoices — unchanged.
- **Transition guards added in the backend** (missing today): pay works only
  on `sent`/`overdue`; cancel does not work on `paid`/`cancelled`.

## Specs

| # | Spec | Depends on | Status |
|---|------|-----------|--------|
| 0 | [Backend: draft creation, send action, transition guards](./spec-0-backend-foundation.md) | — | Done |
| 1 | [Frontend: save-as-draft, send on detail, pay guard](./spec-1-frontend-draft-ux.md) | Spec 0 | Done |

## Shared notes

- **Auth model.** A user only sees invoices where they are issuer or debtor.
  Send and cancel require `issuerUserId` match.
- **No migration needed.** `invoices.status` is a plain `varchar(20)` and
  `draft` is already a valid value.
- **Commit discipline:** small commits only — each numbered commit in the
  spec files is exactly one git commit.

## Tech stack

- Backend: NestJS + TypeORM + Postgres (action → transaction-script → repository).
- Frontend: React + Vite + Material-UI + Axios.
