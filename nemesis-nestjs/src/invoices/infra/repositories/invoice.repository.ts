import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Invoice,
  INVOICE_STATUS,
  InvoiceStatusType,
} from '../../domain/entities/invoice.entity';

@Injectable()
export class InvoiceRepository {
  constructor(
    @InjectRepository(Invoice)
    private readonly repository: Repository<Invoice>,
  ) {}

  async findPendingByDebtorUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        debtorUserId: userId,
        status: In([INVOICE_STATUS.SENT, INVOICE_STATUS.OVERDUE]),
      },
      order: { dueDate: 'ASC' },
    });
  }

  async findCompletedByDebtorUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        debtorUserId: userId,
        status: INVOICE_STATUS.PAID,
      },
      order: { dueDate: 'DESC' },
    });
  }

  async findPendingByIssuerUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        issuerUserId: userId,
        status: In([INVOICE_STATUS.SENT, INVOICE_STATUS.OVERDUE]),
      },
      order: { dueDate: 'ASC' },
    });
  }

  async findCompletedByIssuerUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        issuerUserId: userId,
        status: INVOICE_STATUS.PAID,
      },
      order: { dueDate: 'DESC' },
    });
  }

  async findByUserIdWithStatusFilter(
    userId: number,
    statuses?: InvoiceStatusType[],
  ): Promise<Invoice[]> {
    return this.repository.find({
      where: [
        {
          issuerUserId: userId,
          ...(statuses && statuses.length > 0 ? { status: In(statuses) } : {}),
        },
        {
          debtorUserId: userId,
          ...(statuses && statuses.length > 0 ? { status: In(statuses) } : {}),
        },
      ],
      order: { dueDate: 'DESC' },
    });
  }

  async create(invoice: Partial<Invoice>): Promise<Invoice> {
    const newInvoice = this.repository.create(invoice);
    return this.repository.save(newInvoice);
  }

  async findById(id: number): Promise<Invoice | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(invoice: Invoice): Promise<Invoice> {
    return this.repository.save(invoice);
  }
}
