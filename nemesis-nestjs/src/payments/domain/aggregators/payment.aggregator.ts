import { Injectable } from '@nestjs/common';
import {
  Payment,
  PaymentCategory,
  PaymentCategoryType,
  PaymentStatus,
} from '../entities/payment.entity';
import { PaymentRepository } from '../../infra/repositories/payment.repository';
import { CreatePaymentApplicationTransactionScript } from '../transaction-scripts/create-payment-application-TS/create-payment-application.transaction.script';
import { PaymentApplication } from '../entities/payment-application.entity';
import { PaymentApplicationRepository } from '../../infra/repositories/payment-application.repository';

export type CreatePaymentCommand = {
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  description?: string;
  category?: PaymentCategoryType;
  payerUserId?: number;
  payeeUserId?: number;
};

@Injectable()
export class PaymentAggregator {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly createPaymentApplicationTransactionScript: CreatePaymentApplicationTransactionScript,
    private readonly paymentApplicationRepository: PaymentApplicationRepository,
  ) {}

  async getAccountBalance(accountId: number): Promise<number> {
    const { credits, debits } =
      await this.paymentRepository.getAccountPaymentsSums(accountId);

    return credits - debits;
  }

  /**
   * Get transaction history for an account
   */
  async getAccountPayments(
    accountId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Payment[]> {
    return this.paymentRepository.getAccountPayments(accountId, limit, offset);
  }

  /**
   * Get recent transactions for a user across all their accounts
   */
  async getUserRecentTransactions(
    userId: number,
    limit: number = 10,
  ): Promise<Payment[]> {
    return this.paymentRepository.getUserPayments(userId, limit);
  }

  async createInitialPayment(data: CreatePaymentCommand): Promise<Payment> {
    // Validate business rules within this context
    if (data.debitAccountId === data.creditAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    if (data.amount <= 0) {
      throw new Error('Transaction amount must be positive');
    }

    return this.paymentRepository.create({
      debitAccountId: data.debitAccountId,
      creditAccountId: data.creditAccountId,
      amount: data.amount,
      description: data.description || 'Transfer',
      category: data.category || PaymentCategory.POS,
      status: PaymentStatus.PENDING,
      payerUserId: data.payerUserId,
      payeeUserId: data.payeeUserId,
    });
  }

  /**
   * Complete a pending payment
   */
  async completePayment(paymentId: number): Promise<Payment> {
    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(`Cannot complete payment with status: ${payment.status}`);
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.updatedAt = new Date();

    return this.paymentRepository.save(payment);
  }

  /**
   * Get payment by ID
   */
  async getById(paymentId: number): Promise<Payment | null> {
    return this.paymentRepository.findById(paymentId);
  }

  /**
   * Verify double-entry integrity for the entire system
   */
  async verifySystemIntegrity(): Promise<{
    isValid: boolean;
    totalDebits: number;
    totalCredits: number;
  }> {
    return this.paymentRepository.verifyDoubleEntryIntegrity();
  }

  /**
   * Create a payment application linking a payment to an invoice
   */
  async createPaymentApplication(
    paymentId: number,
    invoiceId: number,
    appliedAmount: number,
  ): Promise<PaymentApplication> {
    return await this.createPaymentApplicationTransactionScript.execute(
      paymentId,
      invoiceId,
      appliedAmount,
    );
  }

  /**
   * Check if an invoice has any payment applications
   */
  async hasPaymentApplications(invoiceId: number): Promise<boolean> {
    const applications =
      await this.paymentApplicationRepository.findByInvoiceId(invoiceId);
    return applications.length > 0;
  }
}
