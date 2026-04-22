import { Injectable } from '@nestjs/common';
import { Invoice, INVOICE_STATUS } from '../../entities/invoice.entity';
import { InvoiceRepository } from '../../../infra/repositories/invoice.repository';
import { CreateInvoiceRequestDto } from '../../../app/actions/create-invoice-action/create-invoice.request.dto';

@Injectable()
export class CreateInvoiceTransactionScript {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(
    dto: CreateInvoiceRequestDto,
    issuerUserId: number,
  ): Promise<Invoice> {
    const issueDate = new Date();
    issueDate.setHours(0, 0, 0, 0);

    // Parse and validate due date is in the future
    const dueDate = new Date(dto.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate <= issueDate) {
      throw new Error('Due date must be in the future');
    }

    // Validate debtor is different from issuer
    if (dto.debtorUserId === issuerUserId) {
      throw new Error('Cannot send invoice to yourself');
    }

    const invoice = await this.invoiceRepository.create({
      issuerUserId,
      debtorUserId: dto.debtorUserId,
      total: dto.amount,
      balanceDue: dto.amount, // Initially, balance due equals total
      status: INVOICE_STATUS.SENT,
      issueDate,
      dueDate,
      description: dto.description,
    });

    return invoice;
  }
}
