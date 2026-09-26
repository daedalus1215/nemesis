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

    // Parse the date-only string as a *local* calendar date.
    // `new Date("YYYY-MM-DD")` is UTC midnight, which (a) serializes back to
    // the previous day's `date` column in timezones behind UTC, and (b)
    // misorders against local midnight in the comparison below.
    const [year, month, day] = dto.dueDate.split('-').map(Number);
    const dueDate = new Date(year, month - 1, day, 0, 0, 0, 0);

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
      status: dto.send === false ? INVOICE_STATUS.DRAFT : INVOICE_STATUS.SENT,
      issueDate,
      dueDate,
      description: dto.description,
    });

    return invoice;
  }
}
