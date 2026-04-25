import { Injectable } from '@nestjs/common';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';

@Injectable()
export class GetInvoiceByIdTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number): Promise<Invoice | null> {
    return await this.invoiceRepository.findById(invoiceId);
  }
}
