# Spec 0 — Backend: draft creation, send action, transition guards

## Goal

An invoice can be created as `draft`; a draft can be explicitly sent by the
issuer; every status transition is guarded server-side.

## Decisions

- Drafting is a flag on the existing create endpoint (`send: false`) — not a
  new endpoint.
- Sending is a new endpoint: `POST /invoices/:id/send`.
- Guards live in the transaction scripts / service (server-side), not only in
  the UI.

## Commits (one git commit each, in order)

### Commit 1 — `feat(invoices): create invoice as draft via send flag`

- [`create-invoice.request.dto.ts`](../../backend/src/invoices/app/actions/create-invoice-action/create-invoice.request.dto.ts):
  ```ts
  @IsOptional()
  @IsBoolean()
  send?: boolean; // omitted or true → sent (today's behavior)
  ```
- [`create-invoice.transaction.script.ts:35`](../../backend/src/invoices/domain/transaction-scripts/create-invoice-TS/create-invoice.transaction.script.ts):
  `status: dto.send === false ? INVOICE_STATUS.DRAFT : INVOICE_STATUS.SENT`.
- [`create-invoice.response.dto.ts`](../../backend/src/invoices/app/actions/create-invoice-action/create-invoice.response.dto.ts)
  + responder: add `status: invoice.status` so clients can rely on actual
  state.
- Recurring path is untouched (`send` omitted → `sent`).

### Commit 2 — `feat(invoices): send-invoice action (draft → sent)`

New `app/actions/send-invoice-action/` (action, request/response DTOs,
responder) following the pay/cancel action pattern, plus
`domain/transaction-scripts/send-invoice-TS/send-invoice.transaction.script.ts`.

Transaction-script rules, in order:

1. Invoice must exist.
2. Caller must be the issuer (`invoice.issuerUserId === issuerUserId`).
3. `invoice.status` must be `DRAFT` — sending a non-draft is an error.
4. Re-validate the due date: `dueDate > today` (local midnight, same
   convention as create). Otherwise:
   *"Due date has passed — cancel this draft and create a new invoice."*
5. Set `status = SENT`, save, return the invoice.

Wire through `InvoiceService` and register in
[`invoices.module.ts`](../../backend/src/invoices/invoices.module.ts).

### Commit 3 — `fix(invoices): enforce status transition guards`

- `applyPaymentToInvoice` in
  [`invoice.service.ts`](../../backend/src/invoices/domain/services/invoice.service.ts):
  reject unless `status ∈ [SENT, OVERDUE]`.
- [`cancel-invoice.transaction.script.ts`](../../backend/src/invoices/domain/transaction-scripts/cancel-invoice-TS/cancel-invoice.transaction.script.ts):
  reject unless `status ∈ [DRAFT, SENT, OVERDUE]` (paid and already-cancelled
  invoices cannot be cancelled).

## Acceptance criteria

- `POST /invoices` with `send: false` → invoice with `status = draft`;
  without the flag → `sent` (today's behavior).
- `POST /invoices/:id/send` on a draft by the issuer → `sent`. Rejected with
  an error for: non-issuer, non-draft status, past due date, missing invoice.
- Pay on `draft`/`paid`/`cancelled` is rejected server-side; pay on
  `sent`/`overdue` is unchanged.
- Cancel on `paid`/`cancelled` is rejected; cancel on `draft` works.
- A recurring run still produces `sent` invoices.

## Out of scope

- No UI (Spec 1).
- No invoice editing (no edit endpoint exists; a draft whose due date lapses
  is cancelled and recreated).
- The overdue job — see `specs/invoice-list-accuracy/`.

## Tests

- Create TS: `send` omitted → `sent`; `send: false` → `draft`.
- Send TS: happy path; rejections for non-issuer, non-draft, past due date,
  missing invoice.
- Guard tests: pay on draft rejected; cancel on paid rejected; cancel on
  draft OK. Follow the existing `__specs__/*.spec.ts` convention.
