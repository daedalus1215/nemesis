import { Injectable } from '@nestjs/common';
import { Invoice, INVOICE_STATUS } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (invoice.dueDate <= today) {
      throw new Error(
        'Due date has passed — cancel this draft and create a new invoice',
      );
    }

    invoice.status = INVOICE_STATUS.SENT;
    return await this.invoiceRepository.update(invoice);
  }
}
