import { Injectable } from '@nestjs/common';
import {
  PaymentAggregator,
  CreatePaymentCommand,
} from '../aggregators/payment.aggregator';
import { Payment, PaymentCategory } from '../entities/payment.entity';
import { PaymentApplication } from '../entities/payment-application.entity';
import { AccountAggregator } from '../../../ledger/accounts/domain/aggregators/account.aggregator';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentAggregator: PaymentAggregator,
    private readonly accountAggregator: AccountAggregator,
  ) {}

  /**
   * Transfer between accounts with full validation
   */
  async transferBetweenAccounts(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    initiatingUserId: number,
    description?: string,
  ): Promise<Payment> {
    //@TODO: Move to using the nestJS emitter to retrieve this data
    const [fromAccount, toAccount] = await Promise.all([
      this.accountAggregator.getAccountById(fromAccountId, initiatingUserId),
      this.accountAggregator.getAccountByIdWithoutOwnershipCheck(toAccountId),
    ]);

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    //@TODO: Move to using the nestJS emitter to retrieve this data
    const hasPermission = await this.accountAggregator.verifyAccountOwnership(
      fromAccountId,
      initiatingUserId,
    );

    if (!hasPermission) {
      throw new Error('Unauthorized: You do not own the source account');
    }

    return this.createValidatedPayment({
      debitAccountId: fromAccountId,
      creditAccountId: toAccountId,
      amount,
      description:
        description ||
        `Transfer from account ${fromAccountId} to account ${toAccountId}`,
      category: PaymentCategory.POS,
      payerUserId: initiatingUserId,
      payeeUserId: toAccount.ownerId,
    });
  }

  private async createValidatedPayment(
    data: CreatePaymentCommand,
  ): Promise<Payment> {
    const [debitAccount, creditAccount] = await Promise.all([
      this.accountAggregator.getAccountByIdWithoutOwnershipCheck(
        data.debitAccountId,
      ),
      this.accountAggregator.getAccountByIdWithoutOwnershipCheck(
        data.creditAccountId,
      ),
    ]);

    if (!debitAccount) {
      throw new Error(`Debit account ${data.debitAccountId} not found`);
    }

    if (!creditAccount) {
      throw new Error(`Credit account ${data.creditAccountId} not found`);
    }

    const currentBalance = await this.paymentAggregator.getAccountBalance(
      data.debitAccountId,
    );
    if (currentBalance < data.amount) {
      throw new Error(
        `Insufficient funds. Current balance: ${currentBalance}, Required: ${data.amount}`,
      );
    }

    return this.paymentAggregator.completePayment(
      (await this.paymentAggregator.createInitialPayment(data)).id,
    );
  }

  //@TODO: Evaluate if `fromUserId` is ever different than `initiatingUserId`, if not, remove the `initiatingUserId` parameter
  async transferBetweenUsers(
    fromUserId: number,
    toUserId: number,
    amount: number,
    initiatingUserId: number,
    description?: string,
  ): Promise<{
    paymentId: number;
    success: boolean;
    fromAccountId: number;
    toAccountId: number;
  }> {
    const fromAccount =
      await this.accountAggregator.getDefaultAccountForUser(fromUserId);

    const toAccount =
      await this.accountAggregator.getDefaultAccountForUser(toUserId);

    const result = await this.transferBetweenExternalAccounts(
      fromAccount.id,
      toAccount.id,
      amount,
      initiatingUserId,
      description,
    );

    return {
      ...result,
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
    };
  }

  private async transferBetweenExternalAccounts(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    initiatingUserId: number,
    description?: string,
  ): Promise<{ paymentId: number; success: boolean }> {
    const [fromAccount, toAccount] = await Promise.all([
      this.accountAggregator.getAccountById(fromAccountId, initiatingUserId),
      this.accountAggregator.getAccountByIdWithoutOwnershipCheck(toAccountId),
    ]);

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    const hasPermission = await this.accountAggregator.verifyAccountOwnership(
      fromAccountId,
      initiatingUserId,
    );
    if (!hasPermission) {
      throw new Error('Unauthorized: You do not own the source account');
    }

    if (fromAccountId === toAccountId) {
      throw new Error('Cannot transfer to the same account');
    }

    const currentBalance =
      await this.paymentAggregator.getAccountBalance(fromAccountId);
    if (currentBalance < amount) {
      throw new Error(
        `Insufficient funds. Current balance: ${currentBalance}, Required: ${amount}`,
      );
    }

    const payment = await this.paymentAggregator.createInitialPayment({
      debitAccountId: fromAccountId,
      creditAccountId: toAccountId,
      amount,
      description:
        description ||
        `Transfer from account ${fromAccountId} to ${toAccountId}`,
      category: PaymentCategory.POS,
      payerUserId: initiatingUserId,
      payeeUserId: toAccount.ownerId,
    });

    const completedPayment = await this.paymentAggregator.completePayment(
      payment.id,
    );

    return {
      paymentId: completedPayment.id,
      success: true,
    };
  }

  async transferBetweenInternalAccounts(
    fromAccountId: number,
    toAccountId: number,
    amount: number,
    initiatingUserId: number,
    description?: string,
  ): Promise<{ paymentId: number; success: boolean }> {
    const [fromAccount, toAccount] = await Promise.all([
      this.accountAggregator.getAccountById(fromAccountId, initiatingUserId),
      this.accountAggregator.getAccountById(toAccountId, initiatingUserId),
    ]);

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    const currentBalance =
      await this.paymentAggregator.getAccountBalance(fromAccountId);
    if (currentBalance < amount) {
      throw new Error(
        `Insufficient funds. Current balance: ${currentBalance}, Required: ${amount}`,
      );
    }

    const payment = await this.paymentAggregator.createInitialPayment({
      debitAccountId: fromAccountId,
      creditAccountId: toAccountId,
      amount,
      description:
        description ||
        `Transfer from account ${fromAccountId} to ${toAccountId}`,
      category: PaymentCategory.POS,
      payerUserId: initiatingUserId,
      payeeUserId: toAccount.ownerId,
    });

    const completedPayment = await this.paymentAggregator.completePayment(
      payment.id,
    );

    return {
      paymentId: completedPayment.id,
      success: true,
    };
  }

  async getUserTotalBalance(userId: number): Promise<number> {
    const accounts = await this.accountAggregator.getUserAccounts(userId);

    const balances = await Promise.all(
      accounts.map((account) =>
        this.paymentAggregator.getAccountBalance(account.id),
      ),
    );
    const totalBalance = balances.reduce((sum, balance) => sum + balance, 0);

    return totalBalance;
  }

  async getAccountPaymentHistory(
    accountId: number,
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{
    payments: any[];
    currentBalance: number;
    accountInfo: { id: number; name: string; accountType: string };
  }> {
    const account = await this.accountAggregator.getAccountById(
      accountId,
      userId,
    );
    if (!account) {
      throw new Error('Account not found or does not belong to user');
    }

    const payments = await this.paymentAggregator.getAccountPayments(
      accountId,
      limit,
      offset,
    );

    const currentBalance =
      await this.paymentAggregator.getAccountBalance(accountId);

    return {
      payments: payments,
      currentBalance,
      accountInfo: {
        id: account.id,
        name: account.name,
        accountType: account.accountType,
      },
    };
  }

  async createPaymentApplication(
    invoice: {
      debtorUserId: number;
      issuerUserId: number;
      id: number;
    },
    appliedAmount: number,
  ): Promise<PaymentApplication> {
    const result = await this.transferBetweenUsers(
      invoice.debtorUserId,
      invoice.issuerUserId,
      appliedAmount,
      invoice.debtorUserId,
      `Payment for Invoice #${invoice.id}`,
    );
    return await this.paymentAggregator.createPaymentApplication(
      result.paymentId,
      invoice.id,
      appliedAmount,
    );
  }
}
