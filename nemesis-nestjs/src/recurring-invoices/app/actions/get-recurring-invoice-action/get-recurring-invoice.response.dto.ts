import { RecurringInvoiceDto } from '../list-recurring-invoices-action/list-recurring-invoices.response.dto';

export type GetRecurringInvoiceResponseDto = {
  recurringInvoice: RecurringInvoiceDto;
  success: boolean;
};
