import { Controller, Post, ForbiddenException } from '@nestjs/common';
import { ProtectedAction } from '../../../../shared/application/protected-action-options';
import { RecurringInvoiceAggregator } from '../../../domain/aggregators/recurring-invoice.aggregator';
import { ExecutionResult } from '../../../domain/transaction-scripts/execute-schedule-TS/execute-schedule.transaction.script';

export type RunDueRecurringInvoicesDebugResponseDto = {
  success: boolean;
  results: ExecutionResult[];
};

@Controller('recurring-invoices')
export class RunDueRecurringInvoicesDebugAction {
  constructor(
    private readonly recurringInvoiceAggregator: RecurringInvoiceAggregator,
  ) {}

  /**
   * Runs the same pipeline as the cron job. Enable only while testing:
   * `ALLOW_RECURRING_INVOICE_DEBUG=true` in `.env`.
   */
  @Post('debug/run-due')
  @ProtectedAction({
    tag: 'RecurringInvoice',
    summary: 'DEV: run due recurring invoice processing now',
  })
  async handle(): Promise<RunDueRecurringInvoicesDebugResponseDto> {
    if (process.env.ALLOW_RECURRING_INVOICE_DEBUG !== 'true') {
      throw new ForbiddenException(
        'Set ALLOW_RECURRING_INVOICE_DEBUG=true in the environment to use this endpoint.',
      );
    }

    const results =
      await this.recurringInvoiceAggregator.processInvoiceGeneration();

    return { success: true, results };
  }
}
