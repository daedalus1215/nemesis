import { Injectable } from '@nestjs/common';
import {
  RecurringInvoice,
  RECURRING_INVOICE_STATUS,
} from '../../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../../infra/repositories/recurring-invoice.repository';

@Injectable()
export class ActivateRecurringInvoiceTransactionScript {
  constructor(
    private readonly recurringInvoiceRepository: RecurringInvoiceRepository,
  ) {}

  async execute(id: number): Promise<RecurringInvoice> {
    const recurringInvoice = await this.recurringInvoiceRepository.findById(id);
    if (!recurringInvoice) {
      throw new Error('Recurring invoice not found');
    }

    if (recurringInvoice.status === RECURRING_INVOICE_STATUS.CANCELLED) {
      throw new Error('Cannot activate a cancelled recurring invoice');
    }

    if (recurringInvoice.status === RECURRING_INVOICE_STATUS.ACTIVE) {
      throw new Error('Recurring invoice is already active');
    }

    const now = new Date();

    if (recurringInvoice.nextRun < now) {
      recurringInvoice.nextRun = now;
    }

    recurringInvoice.status = RECURRING_INVOICE_STATUS.ACTIVE;
    recurringInvoice.lastError = undefined;

    return this.recurringInvoiceRepository.save(recurringInvoice);
  }
}
