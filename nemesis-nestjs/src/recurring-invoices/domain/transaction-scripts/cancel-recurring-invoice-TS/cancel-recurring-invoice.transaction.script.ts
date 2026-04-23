import { Injectable } from '@nestjs/common';
import {
  RecurringInvoice,
  RECURRING_INVOICE_STATUS,
} from '../../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../../infra/repositories/recurring-invoice.repository';

@Injectable()
export class CancelRecurringInvoiceTransactionScript {
  constructor(
    private readonly recurringInvoiceRepository: RecurringInvoiceRepository,
  ) {}

  async execute(id: number, issuerUserId: number): Promise<RecurringInvoice> {
    const recurringInvoice = await this.recurringInvoiceRepository.findById(id);
    if (!recurringInvoice) {
      throw new Error('Recurring invoice not found');
    }

    if (recurringInvoice.status === RECURRING_INVOICE_STATUS.CANCELLED) {
      throw new Error('Recurring invoice is already cancelled');
    }

    if (recurringInvoice.issuerUserId !== issuerUserId) {
      throw new Error(
        'Unauthorized: Only the issuer can cancel this recurring invoice',
      );
    }

    recurringInvoice.status = RECURRING_INVOICE_STATUS.CANCELLED;
    recurringInvoice.lastError = undefined;

    return this.recurringInvoiceRepository.save(recurringInvoice);
  }
}
