import { Injectable } from '@nestjs/common';
import { AccountAggregator } from '../aggregators/account.aggregator';
import { PaymentAggregator } from '../../../../payments/domain/aggregators/payment.aggregator';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountBalanceService {
  constructor(
    private readonly accountAggregator: AccountAggregator,
    private readonly transactionAggregator: PaymentAggregator,
  ) {}

  /**
   * Get validated account balance with ownership check
   * This service orchestrates between the Account and Transaction domains
   */
  async getValidatedAccountBalance(
    accountId: number,
    userId: number,
  ): Promise<number> {
    // 1. Validate account ownership using AccountAggregator
    const account = await this.accountAggregator.getAccountById(
      accountId,
      userId,
    );
    if (!account) {
      throw new Error(
        `Account ${accountId} not found or does not belong to user`,
      );
    }

    // 2. Get balance from TransactionAggregator
    return this.transactionAggregator.getAccountBalance(accountId);
  }

  async getAccountsWithBalances(
    userId: number,
  ): Promise<(Account & { balance: number })[]> {
    const accounts = await this.accountAggregator.getUserAccounts(userId);
    const balancesEntries = await Promise.all(
      accounts.map(async (account) => [
        account.id,
        await this.transactionAggregator.getAccountBalance(account.id),
      ]),
    );
    const balances = Object.fromEntries(balancesEntries) as {
      [key: number]: number;
    };

    return accounts.map((account) => ({
      ...account,
      balance: balances[account.id] ?? 0,
    }));
  }
}
