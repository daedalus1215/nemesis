import { Injectable } from '@nestjs/common';
import { Invoice, INVOICE_STATUS } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

/** Local calendar day as 'YYYY-MM-DD' (the `date` column's unit of meaning). */
function localDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

@Injectable()
export class SendInvoiceTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number, issuerUserId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.issuerUserId !== issuerUserId) {
      throw new Error('Unauthorized: Only the issuer can send this invoice');
    }

    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error('Only draft invoices can be sent');
    }

    // Re-validate the due date at send time — a draft can sit past its
    // due date, and a lapsed draft must be cancelled and recreated.
    // The `date` column hydrates as a 'YYYY-MM-DD' string; compare calendar
    // days as strings — a Date built from a date-only string is UTC
    // midnight, which misorders against local midnight, and string-vs-Date
    // relational comparison degrades to NaN.
    const dueStr =
      typeof invoice.dueDate === 'string'
        ? invoice.dueDate
        : localDateStr(invoice.dueDate);
    if (dueStr <= localDateStr(new Date())) {
      throw new Error(
        'Due date has passed — cancel this draft and create a new invoice',
      );
    }

    invoice.status = INVOICE_STATUS.SENT;
    return await this.invoiceRepository.update(invoice);
  }
}
