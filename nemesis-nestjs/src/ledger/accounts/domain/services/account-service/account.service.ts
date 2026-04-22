import { Injectable } from '@nestjs/common';
import { Account } from '../../entities/account.entity';
import { GetUserAccountsTransactionScript } from '../../transaction-scripts/get-user-accounts-TS/get-user-accounts.transaction.script';
import { GetAccountByIdTransactionScript } from '../../transaction-scripts/get-account-by-id-TS/get-account-by-id.transaction.script';
import { CreateAccountTransactionScript } from '../../transaction-scripts/create-account-TS/create-account.transaction.script';
import { SetDefaultAccountTransactionScript } from '../../transaction-scripts/set-default-account-TS/set-default-account.transaction.script';
import { EnsureUserHasDefaultAccountInvariant } from '../../invariants/ensure-user-has-default-account-invariant/ensure-user-has-default-account.invariant';
import { AccountRepository } from '../../../infra/repositories/account.repository';
import { AccountType } from '../../../constant';
import { AccountAggregator } from '../../aggregators/account.aggregator';

@Injectable()
export class AccountService {
  constructor(
    private readonly getUserAccountsTS: GetUserAccountsTransactionScript,
    private readonly getAccountByIdTS: GetAccountByIdTransactionScript,
    private readonly createAccountTS: CreateAccountTransactionScript,
    private readonly setDefaultAccountTS: SetDefaultAccountTransactionScript,
    private readonly ensureUserHasDefaultAccountInvariant: EnsureUserHasDefaultAccountInvariant,
    private readonly accountRepository: AccountRepository,
    private readonly accountAggregator: AccountAggregator,
  ) {}

  async getUserAccounts(userId: number): Promise<Account[]> {
    return this.getUserAccountsTS.execute(userId);
  }

  async getDefaultAccount(userId: number): Promise<Account | null> {
    return this.accountRepository.findDefaultByUserId(userId);
  }

  async getAccountById(
    accountId: number,
    userId: number,
  ): Promise<Account | null> {
    return this.getAccountByIdTS.execute(accountId, userId);
  }

  async createAccount(
    userId: number,
    name: string,
    setAsDefault: boolean = false,
    accountType: AccountType = AccountType.ASSET,
  ): Promise<Account> {
    return this.createAccountTS.execute({
      userId,
      name,
      setAsDefault,
      accountType,
    });
  }

  async setDefaultAccount(accountId: number, userId: number): Promise<void> {
    return this.setDefaultAccountTS.execute(accountId, userId);
  }

  async ensureUserHasDefaultAccount(userId: number): Promise<Account> {
    return this.ensureUserHasDefaultAccountInvariant.execute(userId);
  }

  async createAccountForUser(
    userId: number,
    accountName: string,
    accountType: AccountType = 'ASSET',
  ): Promise<{ accountId: number; isDefault: boolean }> {
    const existingAccounts =
      await this.accountAggregator.getUserAccounts(userId);
    const isFirstAccount = existingAccounts.length === 0;

    const account = await this.accountAggregator.create({
      ownerId: userId,
      name: accountName,
      accountType,
      isDefault: isFirstAccount,
    });

    return {
      accountId: account.id,
      isDefault: isFirstAccount,
    };
  }
}
