import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Invoice,
  INVOICE_STATUS,
  INVOICE_DIRECTION,
  InvoiceStatusType,
  InvoiceDirectionType,
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
      order: { dueDate: 'ASC', id: 'DESC' },
    });
  }

  async findCompletedByDebtorUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        debtorUserId: userId,
        status: INVOICE_STATUS.PAID,
      },
      order: { dueDate: 'DESC', id: 'DESC' },
    });
  }

  async findPendingByIssuerUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        issuerUserId: userId,
        status: In([INVOICE_STATUS.SENT, INVOICE_STATUS.OVERDUE]),
      },
      order: { dueDate: 'ASC', id: 'DESC' },
    });
  }

  async findCompletedByIssuerUserId(userId: number): Promise<Invoice[]> {
    return this.repository.find({
      where: {
        issuerUserId: userId,
        status: INVOICE_STATUS.PAID,
      },
      order: { dueDate: 'DESC', id: 'DESC' },
    });
  }

  async findByUserIdWithStatusFilter(
    userId: number,
    statuses?: InvoiceStatusType[],
    direction?: InvoiceDirectionType,
  ): Promise<Invoice[]> {
    const statusFilter =
      statuses && statuses.length > 0 ? { status: In(statuses) } : {};
    const where =
      direction === INVOICE_DIRECTION.ISSUED
        ? [{ issuerUserId: userId, ...statusFilter }]
        : direction === INVOICE_DIRECTION.RECEIVED
          ? [{ debtorUserId: userId, ...statusFilter }]
          : [
              { issuerUserId: userId, ...statusFilter },
              { debtorUserId: userId, ...statusFilter },
            ];
    return this.repository.find({
      where,
      order: { dueDate: 'DESC', id: 'DESC' },
    });
  }

  /**
   * `before` is a 'YYYY-MM-DD' calendar day (the `date` column's unit);
   * Postgres coerces the text parameter to `date`, so the comparison is
   * day-for-day regardless of process/database timezone.
   */
  async markOverdue(before: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Invoice)
      .set({ status: INVOICE_STATUS.OVERDUE })
      .where('status = :status', { status: INVOICE_STATUS.SENT })
      .andWhere('dueDate < :before', { before })
      .execute();
    return result.affected ?? 0;
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
