import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create__transaction__table1750000002000
  implements MigrationInterface
{
  name = 'Create__transaction__table1750000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Transaction table with double-entry structure
    await queryRunner.query(`
      CREATE TABLE "transaction" (
        "id" VARCHAR PRIMARY KEY NOT NULL,
        "amount" DECIMAL(20,8) NOT NULL,
        "description" VARCHAR,
        "status" VARCHAR(20) NOT NULL DEFAULT ('PENDING'),
        "category" VARCHAR(50) NOT NULL DEFAULT ('transfer'),
        "debitAccountId" INTEGER NOT NULL,
        "creditAccountId" INTEGER NOT NULL,
        "initiatingUserId" INTEGER,
        "counterpartyUserId" INTEGER,
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )
    `);

    console.log('✅ Transaction table created with double-entry structure');
    console.log('📊 Double-entry fields: debitAccountId, creditAccountId');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction"`);
    console.log('❌ Transaction table dropped');
  }
}
