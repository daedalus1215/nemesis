import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_IdToInteger_PaymentsTable1762047700172
  implements MigrationInterface
{
  name = 'Alter_IdToInteger_PaymentsTable1762047700172';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite doesn't support ALTER COLUMN, so we need to recreate the table

    // Step 1: Check if there's existing data
    const existingData = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "payments"`,
    );
    const hasData = existingData[0]?.count > 0;

    if (hasData) {
      console.log(
        `⚠️  Found ${existingData[0].count} existing payments. They will be re-assigned integer IDs.`,
      );
    }

    // Step 2: Create new table with integer ID
    await queryRunner.query(`
            CREATE TABLE "payments_new" (
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

    // Step 3: Copy data from old table to new table (if any exists)
    // Note: Old UUID IDs will be replaced with new auto-increment integer IDs
    if (hasData) {
      await queryRunner.query(`
                INSERT INTO "payments_new" (
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
                FROM "payments"
            `);
      console.log('✅ Migrated existing payment data with new integer IDs');
    }

    // Step 4: Drop the old table
    await queryRunner.query(`DROP TABLE "payments"`);

    // Step 5: Rename the new table to the original name
    await queryRunner.query(`ALTER TABLE "payments_new" RENAME TO "payments"`);

    console.log(
      '✅ Successfully changed Payment.id from varchar UUID to integer auto-increment',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse: change back to varchar UUID
    // Note: We can't restore the original UUIDs, so we'll generate new UUIDs

    // Step 1: Create new table with varchar UUID ID
    await queryRunner.query(`
            CREATE TABLE "payments_old" (
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

    // Step 2: Copy data and generate new string IDs
    // Note: Original UUIDs cannot be restored - new string IDs will be generated
    const existingData = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "payments"`,
    );
    const hasData = existingData[0]?.count > 0;

    if (hasData) {
      // Generate simple unique string IDs based on timestamp and random
      // This is not a perfect UUID but serves the rollback purpose
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
                    'payment-' || CAST(rowid AS TEXT) || '-' || lower(hex(randomblob(8))) as "id",
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
                FROM "payments"
            `);
    }

    // Step 3: Drop the integer ID table
    await queryRunner.query(`DROP TABLE "payments"`);

    // Step 4: Rename the old table back
    await queryRunner.query(`ALTER TABLE "payments_old" RENAME TO "payments"`);

    console.log(
      '✅ Rolled back: changed Payment.id from integer back to varchar UUID (new UUIDs generated)',
    );
  }
}
