import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { GetAccountByIdTransactionScript } from '../transaction-scripts/get-account-by-id-TS/get-account-by-id.transaction.script';
import { GetUserAccountsTransactionScript } from '../transaction-scripts/get-user-accounts-TS/get-user-accounts.transaction.script';
import { EnsureUserHasDefaultAccountInvariant } from '../invariants/ensure-user-has-default-account-invariant/ensure-user-has-default-account.invariant';
import { CreateAccountTransactionScript } from '../transaction-scripts/create-account-TS/create-account.transaction.script';
import { SetDefaultAccountTransactionScript } from '../transaction-scripts/set-default-account-TS/set-default-account.transaction.script';
import { GetAccountByIdWithoutOwnershipTransactionScript } from '../transaction-scripts/get-account-by-id-without-ownership-TS/get-account-by-id-without-ownership.transaction.script';

@Injectable()
export class AccountAggregator {
  constructor(
    private readonly getAccountByIdTS: GetAccountByIdTransactionScript,
    private readonly getUserAccountsTS: GetUserAccountsTransactionScript,
    private readonly ensureUserHasDefaultAccountTS: EnsureUserHasDefaultAccountInvariant,
    private readonly createAccountTS: CreateAccountTransactionScript,
    private readonly setDefaultAccountTS: SetDefaultAccountTransactionScript,
    private readonly getAccountByIdWithoutOwnershipTS: GetAccountByIdWithoutOwnershipTransactionScript,
  ) {}

  /**
   * Get account by ID
   */
  async getAccountById(
    accountId: number,
    userId: number,
  ): Promise<Account | null> {
    return this.getAccountByIdTS.execute(accountId, userId);
  }

  /**
   * Get the default account for a user, creating one if it doesn't exist
   * This is the main method other domains should use when they need to resolve a user to an account
   */
  async getDefaultAccountForUser(userId: number): Promise<Account> {
    return this.ensureUserHasDefaultAccountTS.execute(userId);
  }

  /**
   * Get all accounts for a user
   */
  async getUserAccounts(userId: number): Promise<Account[]> {
    return await this.getUserAccountsTS.execute(userId);
  }

  /**
   * Verify if an account belongs to a specific user
   */
  async verifyAccountOwnership(
    accountId: number,
    userId: number,
  ): Promise<boolean> {
    const account = await this.getAccountByIdTS.execute(accountId, userId);
    return account?.ownerId === userId;
  }

  /**
   * Create a new account
   */
  async create(data: {
    ownerId: number;
    name: string;
    accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
    isDefault?: boolean;
  }): Promise<Account> {
    return await this.createAccountTS.execute({
      userId: data.ownerId,
      name: data.name,
      setAsDefault: data.isDefault || false,
      accountType: data.accountType,
    });
  }

  /**
   * Set an account as the default for a user
   */
  async setAsDefault(accountId: number, userId: number): Promise<void> {
    return this.setDefaultAccountTS.execute(accountId, userId);
  }

  /**
   * Get account by ID without ownership validation (for cross-user transfers)
   * This should only be used when you need to validate account existence
   * but don't need to verify ownership
   */
  async getAccountByIdWithoutOwnershipCheck(
    accountId: number,
  ): Promise<Account | null> {
    return this.getAccountByIdWithoutOwnershipTS.execute(accountId);
  }
}
