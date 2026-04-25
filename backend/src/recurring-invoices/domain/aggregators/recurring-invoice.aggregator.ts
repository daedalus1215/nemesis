import { Injectable, Logger } from '@nestjs/common';
import { RecurringInvoiceService } from '../services/recurring-invoice.service';
import { InvoiceService } from '../../../invoices/domain/services/invoice.service';
import { RecurringInvoice } from '../entities/recurring-invoice.entity';
import { ExecutionResult } from '../transaction-scripts/execute-schedule-TS/execute-schedule.transaction.script';

@Injectable()
export class RecurringInvoiceAggregator {
  private readonly logger = new Logger(RecurringInvoiceAggregator.name);

  constructor(
    private readonly recurringInvoiceService: RecurringInvoiceService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async processInvoiceGeneration(): Promise<ExecutionResult[]> {
    const dueInvoices =
      await this.recurringInvoiceService.getDueForExecution();

    if (dueInvoices.length === 0) {
      this.logger.debug('No recurring invoices due for execution');
      return [];
    }

    this.logger.log(
      `Processing ${dueInvoices.length} recurring invoice(s)`,
    );

    const results: ExecutionResult[] = [];

    for (const recurringInvoice of dueInvoices) {
      const result =
        await this.recurringInvoiceService.executeSchedule.execute(
          recurringInvoice,
          (ri: RecurringInvoice) => this.createInvoiceFromRecurring(ri),
        );
      results.push(result);
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    this.logger.log(
      `Execution complete: ${succeeded} succeeded, ${failed} failed`,
    );

    return results;
  }

  private async createInvoiceFromRecurring(
    recurringInvoice: RecurringInvoice,
  ): Promise<number> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await this.invoiceService.createInvoice(
      {
        debtorUserId: recurringInvoice.debtorUserId,
        amount: recurringInvoice.amount,
        description:
          recurringInvoice.description ??
          `Recurring invoice ${recurringInvoice.recurringInvoiceId}`,
        dueDate: dueDate.toISOString().split('T')[0],
      },
      recurringInvoice.issuerUserId,
    );

    return invoice.id;
  }
}
