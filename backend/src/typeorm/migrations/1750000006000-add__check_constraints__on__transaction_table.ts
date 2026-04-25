import { MigrationInterface, QueryRunner } from 'typeorm';

export class Add__check_constraints__on__transaction_table1750000006000
  implements MigrationInterface
{
  name = 'Add__check_constraints__on__transaction_table1750000006000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add business rule constraints to transaction table
    await queryRunner.query(`
      CREATE TABLE "transaction_new" (
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
        "updatedAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        
        -- Business rule constraints
        CONSTRAINT "chk_transaction_positive_amount" CHECK (amount > 0),
        CONSTRAINT "chk_transaction_different_accounts" CHECK (debitAccountId != creditAccountId),
        CONSTRAINT "chk_transaction_valid_status" CHECK (
          status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        ),
        CONSTRAINT "chk_transaction_valid_category" CHECK (
          category IN ('transfer', 'payment', 'fee', 'interest', 'adjustment')
        )
      )
    `);

    // Copy data from old table
    await queryRunner.query(`
      INSERT INTO "transaction_new" 
      SELECT * FROM "transaction"
    `);

    // Replace old table
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(
      `ALTER TABLE "transaction_new" RENAME TO "transaction"`,
    );

    console.log('✅ Business rule constraints added to transaction table:');
    console.log('  - Amount must be positive');
    console.log('  - Debit and credit accounts must be different');
    console.log('  - Status must be valid enum value');
    console.log('  - Category must be valid enum value');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove business rule constraints
    await queryRunner.query(`
      CREATE TABLE "transaction_new" (
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

    await queryRunner.query(`
      INSERT INTO "transaction_new" 
      SELECT * FROM "transaction"
    `);

    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(
      `ALTER TABLE "transaction_new" RENAME TO "transaction"`,
    );

    console.log('❌ Business rule constraints removed from transaction table');
  }
}
