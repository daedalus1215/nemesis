import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import {
  RecurringInvoice,
  RECURRING_INVOICE_STATUS,
  RecurringInvoiceStatusType,
} from '../../domain/entities/recurring-invoice.entity';

@Injectable()
export class RecurringInvoiceRepository {
  constructor(
    @InjectRepository(RecurringInvoice)
    private readonly repository: Repository<RecurringInvoice>,
  ) {}

  async create(data: Partial<RecurringInvoice>): Promise<RecurringInvoice> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async save(entity: RecurringInvoice): Promise<RecurringInvoice> {
    return this.repository.save(entity);
  }

  async findById(id: number): Promise<RecurringInvoice | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByRecurringInvoiceId(
    recurringInvoiceId: string,
  ): Promise<RecurringInvoice | null> {
    return this.repository.findOne({ where: { recurringInvoiceId } });
  }

  async findByIssuerUserId(
    issuerUserId: number,
    status?: RecurringInvoiceStatusType,
  ): Promise<RecurringInvoice[]> {
    return this.repository.find({
      where: {
        issuerUserId,
        ...(status ? { status } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findDueForExecution(now: Date): Promise<RecurringInvoice[]> {
    return this.repository.find({
      where: {
        status: RECURRING_INVOICE_STATUS.ACTIVE,
        nextRun: LessThanOrEqual(now),
      },
      order: { nextRun: 'ASC' },
    });
  }

  async countByDatePrefix(datePrefix: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('ri')
      .where('ri.recurring_invoice_id LIKE :prefix', {
        prefix: `REC-${datePrefix}-%`,
      })
      .getCount();
    return result;
  }
}
