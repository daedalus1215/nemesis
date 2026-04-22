import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../../infra/repositories/account.repository';

@Injectable()
export class SetDefaultAccountTransactionScript {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(accountId: number, userId: number): Promise<void> {
    const account = await this.accountRepository.findByAccountIdAndUserId(
      accountId,
      userId,
    );
    if (!account || account.ownerId !== userId) {
      throw new Error('Account not found or does not belong to user');
    }

    await this.accountRepository.setAsDefault(accountId, userId);
  }
}
