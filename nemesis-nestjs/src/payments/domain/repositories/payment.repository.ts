import { Payment } from '../entities/payment.entity';

export type PaymentRepositoryPort = {
  create(data: Partial<Payment>): Promise<Payment>;
  save(transaction: Payment): Promise<Payment>;
  findById(id: number): Promise<Payment | null>;
  getAccountPaymentsSums(
    accountId: number,
  ): Promise<{ debits: number; credits: number }>;
  getAccountCompletedPayments(
    accountId: number,
    limit?: number,
    offset?: number,
  ): Promise<Payment[]>;
  getUserPayments(userId: number, limit?: number): Promise<Payment[]>;
  verifyDoubleEntryIntegrity(): Promise<{
    isValid: boolean;
    totalDebits: number;
    totalCredits: number;
  }>;
};
