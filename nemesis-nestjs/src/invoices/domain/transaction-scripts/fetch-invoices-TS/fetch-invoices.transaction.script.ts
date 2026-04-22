import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceStatusType } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class FetchInvoicesTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(
    userId: number,
    statuses?: InvoiceStatusType[],
  ): Promise<Invoice[]> {
    return await this.invoiceRepository.findByUserIdWithStatusFilter(
      userId,
      statuses,
    );
  }
}
