export const INVOICE_DETAIL_URL = (invoiceId: number) => `/invoices/detail/${invoiceId}`;
export const CANCEL_INVOICE_URL = (invoiceId: number) => `/invoices/${invoiceId}/cancel`;

export const RECURRING_INVOICE_DETAIL_URL = (id: number) => `/recurring-invoices/${id}`;
export const ACTIVATE_RECURRING_INVOICE_URL = (id: number) => `/recurring-invoices/${id}/activate`;
export const PAUSE_RECURRING_INVOICE_URL = (id: number) => `/recurring-invoices/${id}/pause`;
export const CANCEL_RECURRING_INVOICE_URL = (id: number) => `/recurring-invoices/${id}/cancel`;
