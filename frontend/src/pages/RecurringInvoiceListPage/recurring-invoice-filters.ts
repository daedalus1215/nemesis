/** The recurring invoice list's filters, in the order its buttons show them. */
export const RECURRING_INVOICE_STATUS_FILTERS = [
  "ACTIVE",
  "all",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type RecurringInvoiceStatusFilter =
  (typeof RECURRING_INVOICE_STATUS_FILTERS)[number];

/**
 * GET /recurring-invoices query params for a status (none for every one).
 * Shared with the offline prefetch, whose stored answers are keyed by them.
 */
export const recurringInvoiceListParams = (
  status?: string
): Record<string, string> => (status ? { status } : {});
