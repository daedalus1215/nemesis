import { Injectable } from '@nestjs/common';
import { Account } from '../../entities/account.entity';
import { AccountRepository } from '../../../infra/repositories/account.repository';

@Injectable()
export class GetAccountByIdTransactionScript {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(accountId: number, userId: number): Promise<Account | null> {
    return this.accountRepository.findByAccountIdAndUserId(accountId, userId);
  }
}
