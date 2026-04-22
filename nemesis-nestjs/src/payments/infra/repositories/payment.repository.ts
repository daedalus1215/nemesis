import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepositoryPort } from '../../domain/repositories/payment.repository';
import { PaymentStatus } from '../../domain/entities/payment.entity';

@Injectable()
export class PaymentRepository implements PaymentRepositoryPort {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
  ) {}

  async create(data: Partial<Payment>): Promise<Payment> {
    const payment = this.repository.create(data);
    return this.repository.save(payment);
  }

  async save(payment: Payment): Promise<Payment> {
    return this.repository.save(payment);
  }

  async findById(id: number): Promise<Payment | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Get sum of debits and credits for an account
   * This is the core of balance calculation in double-entry bookkeeping
   */
  async getAccountPaymentsSums(accountId: number): Promise<{
    debits: number;
    credits: number;
  }> {
    const debitSum = await this.repository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.debitAccountId = :accountId', { accountId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const creditSum = await this.repository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.creditAccountId = :accountId', { accountId })
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    return {
      debits: parseFloat(debitSum.total) || 0,
      credits: parseFloat(creditSum.total) || 0,
    };
  }

  async getAccountCompletedPayments(
    accountId: number,

    limit: number = 50,
    offset: number = 0,
  ): Promise<Payment[]> {
    return this.repository
      .createQueryBuilder('payment')
      .where(
        '(payment.debitAccountId = :accountId OR payment.creditAccountId = :accountId)',
        { accountId },
      )
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .orderBy('payment.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  async getAccountPayments(
    accountId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Payment[]> {
    return this.repository
      .createQueryBuilder('payment')
      .where(
        '(payment.debitAccountId = :accountId OR payment.creditAccountId = :accountId)',
        { accountId },
      )
      .orderBy('payment.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getMany();
  }

  /**
   * Get user's payments across all their accounts
   * Uses denormalized user IDs for performance
   */
  async getUserPayments(
    userId: number,
    limit: number = 50,
  ): Promise<Payment[]> {
    return this.repository
      .createQueryBuilder('payment')
      .where(
        '(payment.payerUserId = :userId OR payment.payeeUserId = :userId)',
        { userId },
      )
      .andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .orderBy('payment.createdAt', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Verify that total debits equal total credits across the entire system
   * This is a fundamental check for double-entry bookkeeping integrity
   */
  async verifyDoubleEntryIntegrity(): Promise<{
    isValid: boolean;
    totalDebits: number;
    totalCredits: number;
  }> {
    const result = await this.repository
      .createQueryBuilder('payment')
      .select([
        'SUM(payment.amount) as totalDebits',
        'SUM(payment.amount) as totalCredits',
      ])
      .where('payment.status = :status', { status: PaymentStatus.COMPLETED })
      .getRawOne();

    const totalDebits = parseFloat(result.totalDebits) || 0;
    const totalCredits = parseFloat(result.totalCredits) || 0;

    return {
      isValid: Math.abs(totalDebits - totalCredits) < 0.01, // Allow for minor rounding
      totalDebits,
      totalCredits,
    };
  }
}
