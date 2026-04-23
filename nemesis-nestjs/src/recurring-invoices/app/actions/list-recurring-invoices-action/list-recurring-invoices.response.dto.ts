export type RecurringInvoiceDto = {
  id: number;
  recurringInvoiceId: string;
  issuerUserId: number;
  debtorUserId: number;
  amount: number;
  intervalType: string;
  intervalCount: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour: number;
  status: string;
  nextRun: string;
  lastRun?: string;
  lastError?: string;
  description?: string;
  createdAt: string;
};

export type ListRecurringInvoicesResponseDto = {
  recurringInvoices: RecurringInvoiceDto[];
  success: boolean;
};
