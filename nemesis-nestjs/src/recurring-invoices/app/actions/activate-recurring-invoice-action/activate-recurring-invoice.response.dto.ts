export type ActivateRecurringInvoiceResponseDto = {
  recurringInvoiceId: string;
  status: string;
  nextRun: string;
  success: boolean;
};
