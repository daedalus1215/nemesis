/** The invoice list's filters, in the order its buttons show them. */
export const INVOICE_STATUS_FILTERS = [
  "pending",
  "all",
  "draft",
  "sent",
  "received",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatusFilter = (typeof INVOICE_STATUS_FILTERS)[number];

/**
 * What a filter asks the server for. "Sent" and "received" are every
 * non-draft invoice in that direction; the rest filter by status alone.
 */
export const invoiceFilterQuery = (
  filter: InvoiceStatusFilter
): { statuses?: string[]; direction?: string } => ({
  statuses:
    filter === "all"
      ? undefined
      : filter === "pending"
      ? ["sent", "overdue"]
      : filter === "sent" || filter === "received"
      ? ["sent", "overdue", "paid", "cancelled"]
      : [filter],
  direction:
    filter === "sent" ? "issued" : filter === "received" ? "received" : undefined,
});

/** The statuses as one stable key: sorted and joined, or "all". */
export const statusesKey = (statuses?: string[]): string =>
  statuses && statuses.length > 0 ? [...statuses].sort().join(",") : "all";

/**
 * GET /invoices query params. The offline prefetch (src/offline/prefetch.ts)
 * requests every filter with these, and its stored answers are keyed by the
 * exact query, so the list must build its requests here too.
 */
export const invoiceListParams = (
  statusKey: string,
  direction?: string
): Record<string, string> => {
  const params: Record<string, string> = {};
  if (statusKey !== "all") {
    params.statuses = statusKey;
  }
  if (direction) {
    params.direction = direction;
  }
  return params;
};
