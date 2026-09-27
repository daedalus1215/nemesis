import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InvoiceService } from '../../domain/services/invoice.service';

@Injectable()
export class OverdueInvoiceScheduler implements OnModuleInit {
  private readonly logger = new Logger(OverdueInvoiceScheduler.name);

  constructor(private readonly invoiceService: InvoiceService) {}

  async onModuleInit(): Promise<void> {
    await this.markOverdue();
  }

  @Cron('5 0 * * *')
  async runDaily(): Promise<void> {
    await this.markOverdue();
  }

  private async markOverdue(): Promise<void> {
    this.logger.debug('Running overdue invoice check');
    try {
      const count = await this.invoiceService.markOverdueInvoices();
      this.logger.log(`Overdue invoice check complete (${count} flipped)`);
    } catch (error) {
      this.logger.error(
        'Overdue invoice scheduler failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
