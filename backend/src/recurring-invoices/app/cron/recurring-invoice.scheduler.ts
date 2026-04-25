import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecurringInvoiceAggregator } from '../../domain/aggregators/recurring-invoice.aggregator';

@Injectable()
export class RecurringInvoiceScheduler {
  private readonly logger = new Logger(RecurringInvoiceScheduler.name);

  constructor(
    private readonly recurringInvoiceAggregator: RecurringInvoiceAggregator,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async execute(): Promise<void> {
    this.logger.debug('Running recurring invoice check');
    try {
      await this.recurringInvoiceAggregator.processInvoiceGeneration();
    } catch (error) {
      this.logger.error(
        'Recurring invoice scheduler failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
