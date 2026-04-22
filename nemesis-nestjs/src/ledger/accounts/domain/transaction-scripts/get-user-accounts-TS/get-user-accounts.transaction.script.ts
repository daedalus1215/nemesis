import { Injectable } from '@nestjs/common';
import { Account } from '../../entities/account.entity';
import { AccountRepository } from '../../../infra/repositories/account.repository';

@Injectable()
export class GetUserAccountsTransactionScript {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(userId: number): Promise<Account[]> {
    return await this.accountRepository.findByUserId(userId);
  }
}
