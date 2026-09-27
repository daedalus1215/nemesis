import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class MarkOverdueInvoicesTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  /**
   * Flip every `sent` invoice with a due date before today (local midnight)
   * to `overdue`. Returns the number of invoices flipped.
   */
  async execute(): Promise<number> {
    const before = new Date();
    before.setHours(0, 0, 0, 0);
    return await this.invoiceRepository.markOverdue(before);
  }
}
