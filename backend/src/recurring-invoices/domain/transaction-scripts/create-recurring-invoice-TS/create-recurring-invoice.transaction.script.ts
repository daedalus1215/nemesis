import { Injectable } from '@nestjs/common';
import {
  RecurringInvoice,
  RECURRING_INVOICE_STATUS,
  IntervalTypeValue,
  INTERVAL_TYPE,
} from '../../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../../infra/repositories/recurring-invoice.repository';
import { calculateNextRun } from './calculate-next-run';

export type CreateRecurringInvoiceInput = {
  issuerUserId: number;
  debtorUserId: number;
  amount: number;
  intervalType: IntervalTypeValue;
  intervalCount: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOffset?: number;
  hour?: number;
  description?: string;
};

@Injectable()
export class CreateRecurringInvoiceTransactionScript {
  constructor(
    private readonly recurringInvoiceRepository: RecurringInvoiceRepository,
  ) {}

  async execute(input: CreateRecurringInvoiceInput): Promise<RecurringInvoice> {
    if (input.debtorUserId === input.issuerUserId) {
      throw new Error('Cannot create a recurring invoice to yourself');
    }

    if (input.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const hour = input.hour ?? 9;
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }

    if (input.intervalCount < 1) {
      throw new Error('Interval count must be at least 1');
    }

    if (
      input.intervalType === INTERVAL_TYPE.WEEK &&
      input.dayOfWeek !== undefined &&
      (input.dayOfWeek < 0 || input.dayOfWeek > 6)
    ) {
      throw new Error('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    if (
      input.intervalType === INTERVAL_TYPE.MONTH &&
      input.dayOfMonth !== undefined &&
      (input.dayOfMonth < 0 || input.dayOfMonth > 31)
    ) {
      throw new Error('Day of month must be between 0 (last day) and 31');
    }

    const recurringInvoiceId = await this.generateId();

    const nextRun = calculateNextRun({
      intervalType: input.intervalType,
      intervalCount: input.intervalCount,
      dayOfWeek: input.dayOfWeek,
      dayOfMonth: input.dayOfMonth,
      monthOffset: input.monthOffset,
      hour,
      fromDate: new Date(),
    });

    return this.recurringInvoiceRepository.create({
      recurringInvoiceId,
      issuerUserId: input.issuerUserId,
      debtorUserId: input.debtorUserId,
      amount: input.amount,
      intervalType: input.intervalType,
      intervalCount: input.intervalCount,
      dayOfWeek: input.dayOfWeek,
      dayOfMonth: input.dayOfMonth,
      monthOffset: input.monthOffset,
      hour,
      status: RECURRING_INVOICE_STATUS.ACTIVE,
      nextRun,
      description: input.description,
    });
  }

  private async generateId(): Promise<string> {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count =
      await this.recurringInvoiceRepository.countByDatePrefix(datePrefix);
    const sequence = String(count + 1).padStart(4, '0');
    return `REC-${datePrefix}-${sequence}`;
  }
}
