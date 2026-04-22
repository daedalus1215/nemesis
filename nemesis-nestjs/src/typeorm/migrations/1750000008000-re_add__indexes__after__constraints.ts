import { MigrationInterface, QueryRunner } from 'typeorm';

export class Re_add__indexes__after__constraints1750000008000
  implements MigrationInterface
{
  name = 'Re_add__indexes__after__constraints1750000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Re-add all indexes after table constraints were applied

    // Account table indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_account_owner" ON "account" ("ownerId")
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_default_account" 
      ON "account" ("ownerId") 
      WHERE "isDefault" = 1
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_account_type" ON "account" ("accountType")
    `);

    // Transaction table indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_debit_account" ON "transaction" ("debitAccountId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_credit_account" ON "transaction" ("creditAccountId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_status" ON "transaction" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_created_at" ON "transaction" ("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_initiating_user" ON "transaction" ("initiatingUserId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_category" ON "transaction" ("category")
    `);

    console.log(
      '✅ All performance indexes re-added after constraint migrations',
    );
    console.log('📊 Account table: 3 indexes');
    console.log('💰 Transaction table: 6 indexes');
    console.log(
      '🚀 Database optimized for double-entry bookkeeping performance',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all indexes
    await queryRunner.query(`DROP INDEX "IDX_transaction_category"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_initiating_user"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_status"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_credit_account"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_debit_account"`);
    await queryRunner.query(`DROP INDEX "IDX_account_type"`);
    await queryRunner.query(`DROP INDEX "IDX_user_default_account"`);
    await queryRunner.query(`DROP INDEX "IDX_account_owner"`);

    console.log('❌ All performance indexes removed');
  }
}
