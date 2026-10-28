import { Injectable } from '@nestjs/common';
import {
  RecurringInvoice,
  RECURRING_INVOICE_STATUS,
} from '../../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../../infra/repositories/recurring-invoice.repository';

@Injectable()
export class PauseRecurringInvoiceTransactionScript {
  constructor(
    private readonly recurringInvoiceRepository: RecurringInvoiceRepository,
  ) {}

  async execute(id: number, issuerUserId: number): Promise<RecurringInvoice> {
    const recurringInvoice = await this.recurringInvoiceRepository.findById(id);
    if (!recurringInvoice) {
      throw new Error('Recurring invoice not found');
    }

    // Before the status checks, so their errors don't describe someone
    // else's recurring invoice.
    if (recurringInvoice.issuerUserId !== issuerUserId) {
      throw new Error(
        'Unauthorized: Only the issuer can pause this recurring invoice',
      );
    }

    if (recurringInvoice.status !== RECURRING_INVOICE_STATUS.ACTIVE) {
      throw new Error('Can only pause an active recurring invoice');
    }

    recurringInvoice.status = RECURRING_INVOICE_STATUS.PAUSED;
    recurringInvoice.lastError = undefined;

    return this.recurringInvoiceRepository.save(recurringInvoice);
  }
}
