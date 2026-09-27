import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
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

  /**
   * A draft is private to its issuer — the debtor never "has" one, so the
   * debtor branch never matches `status = draft`, with or without a status
   * filter (a draft-only filter for a debtor yields no rows).
   */
  async findByUserIdWithStatusFilter(
    userId: number,
    statuses?: InvoiceStatusType[],
    direction?: InvoiceDirectionType,
  ): Promise<Invoice[]> {
    const hasStatusFilter = !!statuses && statuses.length > 0;
    const issuerBranch = {
      issuerUserId: userId,
      ...(hasStatusFilter ? { status: In(statuses) } : {}),
    };
    const debtorBranch = hasStatusFilter
      ? statuses.includes(INVOICE_STATUS.DRAFT)
        ? null
        : { debtorUserId: userId, status: In(statuses) }
      : { debtorUserId: userId, status: Not(INVOICE_STATUS.DRAFT) };
    const where =
      direction === INVOICE_DIRECTION.ISSUED
        ? [issuerBranch]
        : direction === INVOICE_DIRECTION.RECEIVED
          ? debtorBranch
            ? [debtorBranch]
            : []
          : debtorBranch
            ? [issuerBranch, debtorBranch]
            : [issuerBranch];
    if (where.length === 0) {
      return [];
    }
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
