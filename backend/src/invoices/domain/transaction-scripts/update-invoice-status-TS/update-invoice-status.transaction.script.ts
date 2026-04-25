import { Injectable } from '@nestjs/common';
import { Invoice, INVOICE_STATUS } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class UpdateInvoiceStatusTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(
    invoiceId: number,
    balanceDue: number,
    status: (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS],
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.balanceDue = balanceDue;
    invoice.status = status;

    return await this.invoiceRepository.update(invoice);
  }
}
