import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_UserColumns_PaymentsTable1762047821579
  implements MigrationInterface
{
  name = 'Alter_UserColumns_PaymentsTable1762047821579';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite doesn't support ALTER TABLE RENAME COLUMN directly,
    // so we need to create a new table, copy data, drop old table, and rename

    // Step 1: Create new table with renamed columns
    await queryRunner.query(`
            CREATE TABLE "payments_new" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "amount" decimal(12,2) NOT NULL,
                "debit_account_id" integer NOT NULL,
                "credit_account_id" integer NOT NULL,
                "description" varchar,
                "category" varchar(50) NOT NULL DEFAULT ('POS'),
                "status" varchar(20) NOT NULL DEFAULT ('PENDING'),
                "payer_user_id" integer,
                "payee_user_id" integer,
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
                "payer_user_id",
                "payee_user_id",
                "created_at",
                "updated_at"
            )
            SELECT 
                "id",
                "amount",
                "debit_account_id",
                "credit_account_id",
                "description",
                "category",
                "status",
                "initiating_user_id" as "payer_user_id",
                "counterparty_user_id" as "payee_user_id",
                "created_at",
                "updated_at"
            FROM "payments"
        `);

    // Step 3: Drop the old table
    await queryRunner.query(`DROP TABLE "payments"`);

    // Step 4: Rename the new table to the original name
    await queryRunner.query(`ALTER TABLE "payments_new" RENAME TO "payments"`);

    console.log(
      '✅ Successfully renamed initiating_user_id -> payer_user_id and counterparty_user_id -> payee_user_id',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the process: rename back to original names

    // Step 1: Create new table with old column names
    await queryRunner.query(`
            CREATE TABLE "payments_old" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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

    // Step 2: Copy all data from new table to old table format
    await queryRunner.query(`
            INSERT INTO "payments_old" (
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
                "debit_account_id",
                "credit_account_id",
                "description",
                "category",
                "status",
                "payer_user_id" as "initiating_user_id",
                "payee_user_id" as "counterparty_user_id",
                "created_at",
                "updated_at"
            FROM "payments"
        `);

    // Step 3: Drop the new table
    await queryRunner.query(`DROP TABLE "payments"`);

    // Step 4: Rename the old table back
    await queryRunner.query(`ALTER TABLE "payments_old" RENAME TO "payments"`);

    console.log(
      '✅ Rolled back: renamed payer_user_id -> initiating_user_id and payee_user_id -> counterparty_user_id',
    );
  }
}
