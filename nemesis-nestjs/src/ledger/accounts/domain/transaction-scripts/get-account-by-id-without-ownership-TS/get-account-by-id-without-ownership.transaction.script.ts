import { Injectable } from '@nestjs/common';
import { Account } from '../../entities/account.entity';
import { AccountRepository } from '../../../infra/repositories/account.repository';

@Injectable()
export class GetAccountByIdWithoutOwnershipTransactionScript {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(accountId: number): Promise<Account | null> {
    // This bypasses ownership checks - use carefully!
    // Only for validating account existence in cross-user operations
    return this.accountRepository['repository'].findOne({
      where: { id: accountId },
    });
  }
}
