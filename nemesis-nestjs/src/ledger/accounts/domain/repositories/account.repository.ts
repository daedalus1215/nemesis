import { Account } from '../entities/account.entity';

export type AccountRepositoryPort = {
  findByUserId(userId: number): Promise<Account[]>;
  findDefaultByUserId(userId: number): Promise<Account | null>;
  findByAccountIdAndUserId(
    accountId: number,
    userId: number,
  ): Promise<Account | null>;
  create(data: Partial<Account>): Account;
  save(account: Account): Promise<Account>;
  setAsDefault(accountId: number, userId: number): Promise<void>;
};
