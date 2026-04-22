import { Injectable } from '@nestjs/common';
import { Account } from '../../entities/account.entity';
import { CreateAccountTransactionScript } from '../../transaction-scripts/create-account-TS/create-account.transaction.script';
import { AccountRepository } from '../../../infra/repositories/account.repository';

@Injectable()
export class EnsureUserHasDefaultAccountInvariant {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly createAccountTS: CreateAccountTransactionScript,
  ) {}

  async execute(userId: number): Promise<Account> {
    const defaultAccount =
      await this.accountRepository.findDefaultByUserId(userId);

    if (defaultAccount) {
      return defaultAccount;
    }

    return await this.createAccountTS.execute({
      userId,
      name: 'Main',
      setAsDefault: true,
      accountType: 'ASSET',
    });
  }
}
