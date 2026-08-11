import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountRepository } from '../../infra/repositories/account.repository';
import { Account } from '../entities/account.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SystemAccountService implements OnModuleInit {
  private static readonly SYSTEM_ACCOUNT_ID = 1;
  private static readonly SYSTEM_USER_ID = 0; // Special system user ID

  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.ensureSystemUserExists();
    await this.ensureSystemAccountExists();
  }

  /**
   * Ensure the system user exists for foreign key constraint
   */
  private async ensureSystemUserExists(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Check if system user exists
      // ⚠️ Two SQLite-isms had to change for Postgres:
      //   1. `?` placeholders are SQLite/MySQL. Postgres uses $1, $2, …
      //   2. `user` is a RESERVED WORD in Postgres and must be quoted as "user".
      // Neither is caught by the type system or by a migration — they fail at runtime,
      // as `syntax error at end of input`.
      const existingUser = await queryRunner.query(
        'SELECT id FROM "user" WHERE id = $1',
        [SystemAccountService.SYSTEM_USER_ID],
      );

      if (existingUser.length === 0) {
        // Create system user
        await queryRunner.query(
          `
          INSERT INTO "user" (id, username, password)
          VALUES ($1, $2, $3)
        `,
          [
            SystemAccountService.SYSTEM_USER_ID,
            'system',
            'SYSTEM_ACCOUNT_NO_LOGIN', // Special password that prevents login
          ],
        );

        console.log('✅ System user created for foreign key constraint');
      }
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Ensure the system account exists for seed money operations
   */
  private async ensureSystemAccountExists(): Promise<void> {
    // Check if system account exists by trying to find it with system user ID
    const existingAccount =
      await this.accountRepository.findByAccountIdAndUserId(
        SystemAccountService.SYSTEM_ACCOUNT_ID,
        SystemAccountService.SYSTEM_USER_ID,
      );

    if (!existingAccount) {
      await this.createSystemAccount();
    } else {
      console.log('✅ System account already exists');
    }
  }

  /**
   * Create the system account for double-entry bookkeeping
   */
  private async createSystemAccount(): Promise<Account> {
    const accountData = {
      id: SystemAccountService.SYSTEM_ACCOUNT_ID,
      name: 'System Bank Account',
      ownerId: SystemAccountService.SYSTEM_USER_ID,
      accountType: 'ASSET' as const, // Bank account is an asset
      isDefault: false,
    };

    const systemAccount = this.accountRepository.create(accountData);
    const savedAccount = await this.accountRepository.save(systemAccount);

    console.log('✅ System account created for seed money operations');
    console.log(
      `📊 Account ID: ${savedAccount.id}, Name: ${savedAccount.name}`,
    );

    return savedAccount;
  }

  /**
   * Get the system account ID
   */
  getSystemAccountId(): number {
    return SystemAccountService.SYSTEM_ACCOUNT_ID;
  }
}
