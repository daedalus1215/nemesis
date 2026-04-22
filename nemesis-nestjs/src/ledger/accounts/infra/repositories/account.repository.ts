import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../domain/entities/account.entity';
import { AccountRepositoryPort } from '../../domain/repositories/account.repository';

@Injectable()
export class AccountRepository implements AccountRepositoryPort {
  constructor(
    @InjectRepository(Account)
    private readonly repository: Repository<Account>,
  ) {}

  async findByUserId(userId: number): Promise<Account[]> {
    return await this.repository.find({
      where: { ownerId: userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async findDefaultByUserId(userId: number): Promise<Account | null> {
    return this.repository.findOne({
      where: {
        ownerId: userId,
        isDefault: true,
      },
    });
  }

  async findByAccountIdAndUserId(
    accountId: number,
    userId: number,
  ): Promise<Account | null> {
    return this.repository.findOne({
      where: { id: accountId, ownerId: userId },
    });
  }

  create(data: Partial<Account>): Account {
    return this.repository.create(data);
  }

  async save(account: Account): Promise<Account> {
    return this.repository.save(account);
  }

  async setAsDefault(accountId: number, userId: number): Promise<void> {
    // Start a transaction to ensure atomicity
    await this.repository.manager.transaction(async (manager) => {
      // First, unset all default accounts for this user
      await manager.update(Account, { ownerId: userId }, { isDefault: false });

      // Then set the specified account as default
      await manager.update(
        Account,
        { id: accountId, ownerId: userId },
        { isDefault: true },
      );
    });
  }
}
