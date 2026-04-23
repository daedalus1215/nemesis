import { Injectable } from '@nestjs/common';
import {
  CreateRecurringInvoiceInput,
  CreateRecurringInvoiceTransactionScript,
} from '../transaction-scripts/create-recurring-invoice-TS/create-recurring-invoice.transaction.script';
import { ActivateRecurringInvoiceTransactionScript } from '../transaction-scripts/activate-recurring-invoice-TS/activate-recurring-invoice.transaction.script';
import { PauseRecurringInvoiceTransactionScript } from '../transaction-scripts/pause-recurring-invoice-TS/pause-recurring-invoice.transaction.script';
import { CancelRecurringInvoiceTransactionScript } from '../transaction-scripts/cancel-recurring-invoice-TS/cancel-recurring-invoice.transaction.script';
import { ExecuteScheduleTransactionScript } from '../transaction-scripts/execute-schedule-TS/execute-schedule.transaction.script';
import {
  RecurringInvoice,
  RecurringInvoiceStatusType,
} from '../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../infra/repositories/recurring-invoice.repository';

@Injectable()
export class RecurringInvoiceService {
  constructor(
    private readonly createRecurringInvoiceTS: CreateRecurringInvoiceTransactionScript,
    private readonly activateRecurringInvoiceTS: ActivateRecurringInvoiceTransactionScript,
    private readonly pauseRecurringInvoiceTS: PauseRecurringInvoiceTransactionScript,
    private readonly cancelRecurringInvoiceTS: CancelRecurringInvoiceTransactionScript,
    private readonly executeScheduleTS: ExecuteScheduleTransactionScript,
    private readonly recurringInvoiceRepository: RecurringInvoiceRepository,
  ) {}

  async create(input: CreateRecurringInvoiceInput): Promise<RecurringInvoice> {
    return this.createRecurringInvoiceTS.execute(input);
  }

  async get(id: number): Promise<RecurringInvoice | null> {
    return this.recurringInvoiceRepository.findById(id);
  }

  async list(
    issuerUserId: number,
    status?: RecurringInvoiceStatusType,
  ): Promise<RecurringInvoice[]> {
    return this.recurringInvoiceRepository.findByIssuerUserId(
      issuerUserId,
      status,
    );
  }

  async activate(id: number): Promise<RecurringInvoice> {
    return this.activateRecurringInvoiceTS.execute(id);
  }

  async pause(id: number): Promise<RecurringInvoice> {
    return this.pauseRecurringInvoiceTS.execute(id);
  }

  async cancel(id: number, issuerUserId: number): Promise<RecurringInvoice> {
    return this.cancelRecurringInvoiceTS.execute(id, issuerUserId);
  }

  async getDueForExecution(): Promise<RecurringInvoice[]> {
    return this.recurringInvoiceRepository.findDueForExecution(new Date());
  }

  get executeSchedule() {
    return this.executeScheduleTS;
  }
}
