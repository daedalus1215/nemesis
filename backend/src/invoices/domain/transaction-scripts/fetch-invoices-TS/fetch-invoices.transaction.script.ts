import { Injectable } from '@nestjs/common';
import {
  Invoice,
  InvoiceStatusType,
  InvoiceDirectionType,
} from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class FetchInvoicesTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(
    userId: number,
    statuses?: InvoiceStatusType[],
    direction?: InvoiceDirectionType,
  ): Promise<Invoice[]> {
    return await this.invoiceRepository.findByUserIdWithStatusFilter(
      userId,
      statuses,
      direction,
    );
  }
}
