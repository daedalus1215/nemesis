import { Injectable } from '@nestjs/common';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class MarkOverdueInvoicesTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  /**
   * Flip every `sent` invoice whose due date is before today's local
   * calendar day to `overdue`. Returns the number of invoices flipped.
   * A 'YYYY-MM-DD' string is passed so the `date` column is compared
   * day-for-day; a Date parameter carries a timestamp whose timezone
   * offset shifts the cutoff by a day.
   */
  async execute(): Promise<number> {
    const now = new Date();
    const before = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return await this.invoiceRepository.markOverdue(before);
  }
}
