import { Injectable, Logger } from '@nestjs/common';
import { RecurringInvoice } from '../../entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from '../../../infra/repositories/recurring-invoice.repository';
import { calculateNextRun } from '../create-recurring-invoice-TS/calculate-next-run';

/** Runs are accepted if `nextRun` is not older than this (avoids double-send; allows catch-up after downtime). */
const EXECUTION_WINDOW_MS = 10 * 60 * 60 * 1000;

export type ExecutionResult = {
  recurringInvoiceId: string;
  success: boolean;
  invoiceId?: number;
  error?: string;
};

@Injectable()
export class ExecuteScheduleTransactionScript {
  private readonly logger = new Logger(ExecuteScheduleTransactionScript.name);

  constructor(
    private readonly recurringInvoiceRepository: RecurringInvoiceRepository,
  ) {}

  async execute(
    recurringInvoice: RecurringInvoice,
    createInvoiceFn: (ri: RecurringInvoice) => Promise<number>,
  ): Promise<ExecutionResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - EXECUTION_WINDOW_MS);

    if (recurringInvoice.nextRun > now) {
      return {
        recurringInvoiceId: recurringInvoice.recurringInvoiceId,
        success: false,
        error: 'Not yet due for execution',
      };
    }

    if (recurringInvoice.nextRun < windowStart) {
      this.logger.warn(
        `Skipping stale execution for ${recurringInvoice.recurringInvoiceId} ` +
          `(nextRun: ${recurringInvoice.nextRun.toISOString()}, window: ${EXECUTION_WINDOW_MS / 3600000}h)`,
      );
      const nextRun = calculateNextRun({
        intervalType: recurringInvoice.intervalType,
        intervalCount: recurringInvoice.intervalCount,
        dayOfWeek: recurringInvoice.dayOfWeek,
        dayOfMonth: recurringInvoice.dayOfMonth,
        monthOffset: recurringInvoice.monthOffset,
        hour: recurringInvoice.hour,
        fromDate: now,
      });
      recurringInvoice.nextRun = nextRun;
      await this.recurringInvoiceRepository.save(recurringInvoice);

      return {
        recurringInvoiceId: recurringInvoice.recurringInvoiceId,
        success: false,
        error: 'Stale execution skipped, nextRun rescheduled',
      };
    }

    try {
      const invoiceId = await createInvoiceFn(recurringInvoice);

      if (!recurringInvoice.parentInvoiceId) {
        recurringInvoice.parentInvoiceId = invoiceId;
      }

      const nextRun = calculateNextRun({
        intervalType: recurringInvoice.intervalType,
        intervalCount: recurringInvoice.intervalCount,
        dayOfWeek: recurringInvoice.dayOfWeek,
        dayOfMonth: recurringInvoice.dayOfMonth,
        monthOffset: recurringInvoice.monthOffset,
        hour: recurringInvoice.hour,
        fromDate: now,
      });

      recurringInvoice.nextRun = nextRun;
      recurringInvoice.lastRun = now;
      recurringInvoice.lastError = undefined;

      await this.recurringInvoiceRepository.save(recurringInvoice);

      this.logger.log(
        `Executed ${recurringInvoice.recurringInvoiceId} -> Invoice #${invoiceId}`,
      );

      return {
        recurringInvoiceId: recurringInvoice.recurringInvoiceId,
        success: true,
        invoiceId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      recurringInvoice.lastError = errorMessage;
      await this.recurringInvoiceRepository.save(recurringInvoice);

      this.logger.error(
        `Failed to execute ${recurringInvoice.recurringInvoiceId}: ${errorMessage}`,
      );

      return {
        recurringInvoiceId: recurringInvoice.recurringInvoiceId,
        success: false,
        error: errorMessage,
      };
    }
  }
}
