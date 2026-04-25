import { Injectable } from '@nestjs/common';
import { Invoice, INVOICE_STATUS } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class CancelInvoiceTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.balanceDue = 0;
    invoice.status = INVOICE_STATUS.CANCELLED;

    return await this.invoiceRepository.update(invoice);
  }
}
