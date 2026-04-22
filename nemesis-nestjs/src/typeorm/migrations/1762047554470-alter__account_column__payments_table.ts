import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_AccountColumn_PaymentsTable1762047554470
  implements MigrationInterface
{
  name = 'Alter_AccountColumn_PaymentsTable1762047554470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite doesn't support ALTER TABLE RENAME COLUMN directly,
    // so we need to create a new table, copy data, drop old table, and rename

    // Step 1: Create new table with renamed columns
    await queryRunner.query(`
            CREATE TABLE "payments_new" (
                "id" varchar PRIMARY KEY NOT NULL,
                "amount" decimal(12,2) NOT NULL,
                "debit_account_id" integer NOT NULL,
                "credit_account_id" integer NOT NULL,
                "description" varchar,
                "category" varchar(50) NOT NULL DEFAULT ('POS'),
                "status" varchar(20) NOT NULL DEFAULT ('PENDING'),
                "initiating_user_id" integer,
                "counterparty_user_id" integer,
                "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
            )
        `);

    // Step 2: Copy all data from old table to new table
    await queryRunner.query(`
            INSERT INTO "payments_new" (
                "id",
                "amount",
                "debit_account_id",
                "credit_account_id",
                "description",
                "category",
                "status",
                "initiating_user_id",
                "counterparty_user_id",
                "created_at",
                "updated_at"
            )
            SELECT 
                "id",
                "amount",
                "debitAccountId" as "debit_account_id",
                "creditAccountId" as "credit_account_id",
                "description",
                "category",
                "status",
                "initiatingUserId" as "initiating_user_id",
                "counterpartyUserId" as "counterparty_user_id",
                "createdAt" as "created_at",
                "updatedAt" as "updated_at"
            FROM "payments"
        `);

    // Step 3: Drop the old table
    await queryRunner.query(`DROP TABLE "payments"`);

    // Step 4: Rename the new table to the original name
    await queryRunner.query(`ALTER TABLE "payments_new" RENAME TO "payments"`);

    console.log(
      '✅ Successfully renamed debitAccountId -> debit_account_id and creditAccountId -> credit_account_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the process: rename back to camelCase

    // Step 1: Create new table with old column names
    await queryRunner.query(`
            CREATE TABLE "payments_old" (
                "id" varchar PRIMARY KEY NOT NULL,
                "amount" decimal(12,2) NOT NULL,
                "debitAccountId" integer NOT NULL,
                "creditAccountId" integer NOT NULL,
                "description" varchar,
                "category" varchar(50) NOT NULL DEFAULT ('POS'),
                "status" varchar(20) NOT NULL DEFAULT ('PENDING'),
                "initiatingUserId" integer,
                "counterpartyUserId" integer,
                "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
            )
        `);

    // Step 2: Copy all data from new table to old table format
    await queryRunner.query(`
            INSERT INTO "payments_old" (
                "id",
                "amount",
                "debitAccountId",
                "creditAccountId",
                "description",
                "category",
                "status",
                "initiatingUserId",
                "counterpartyUserId",
                "createdAt",
                "updatedAt"
            )
            SELECT 
                "id",
                "amount",
                "debit_account_id" as "debitAccountId",
                "credit_account_id" as "creditAccountId",
                "description",
                "category",
                "status",
                "initiating_user_id" as "initiatingUserId",
                "counterparty_user_id" as "counterpartyUserId",
                "created_at" as "createdAt",
                "updated_at" as "updatedAt"
            FROM "payments"
        `);

    // Step 3: Drop the new table
    await queryRunner.query(`DROP TABLE "payments"`);

    // Step 4: Rename the old table back
    await queryRunner.query(`ALTER TABLE "payments_old" RENAME TO "payments"`);

    console.log(
      '✅ Rolled back: renamed debit_account_id -> debitAccountId and credit_account_id -> creditAccountId',
    );
  }
}
