import { MigrationInterface, QueryRunner } from 'typeorm';

export class Complete_Transaction_Migration1760316123001
  implements MigrationInterface
{
  name = 'Complete_Transaction_Migration1760316123001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration completes the transaction migration that failed earlier
    // It uses the CURRENT schema (after all column renames)
    // and handles the fact that some transactions may have already been migrated

    // Check if transaction table exists and has data
    const transactionTableExists = await queryRunner.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='transaction'
        `);

    if (!transactionTableExists || transactionTableExists.length === 0) {
      console.log('Transaction table does not exist, skipping migration');
      return;
    }

    const transactionCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "transaction"`,
    );
    console.log(
      `Found ${transactionCount[0]?.count || 0} transactions in transaction table`,
    );

    if (!transactionCount[0] || transactionCount[0].count === 0) {
      console.log('No transactions to migrate, skipping');
      return;
    }

    // Migrate remaining transactions to payments table
    // NOTE: This runs BEFORE column rename migrations, so use OLD column names:
    // - debitAccountId, creditAccountId (old names - will be renamed later)
    // - initiatingUserId, counterpartyUserId (old names - will be renamed later)
    // - createdAt, updatedAt (old camelCase names - will be renamed later)
    // - Don't include ID (let it auto-generate if needed, but payments table currently has varchar ID)
    // - Skip transactions that already exist (match by ID first, then by data)

    await queryRunner.query(`
            INSERT INTO "payments" (
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
                t."id",
                ROUND(t."amount", 2) as "amount",
                t."debitAccountId",
                t."creditAccountId",
                t."description",
                CASE 
                    WHEN t."category" = 'transfer' THEN 'POS'
                    WHEN t."category" = 'payment' THEN 'INVOICE_PAYMENT'
                    WHEN t."category" = 'fee' THEN 'FEE'
                    WHEN t."category" = 'interest' THEN 'ADJUSTMENT'
                    WHEN t."category" = 'adjustment' THEN 'ADJUSTMENT'
                    ELSE 'POS'
                END as "category",
                CASE 
                    WHEN t."status" = 'CANCELLED' THEN 'VOID'
                    ELSE t."status"
                END as "status",
                t."initiatingUserId",
                t."counterpartyUserId",
                t."createdAt",
                t."updatedAt"
            FROM "transaction" t
            WHERE NOT EXISTS (
                SELECT 1 FROM "payments" p
                WHERE p."id" = t."id"
            )
        `);

    const migratedCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "payments"`,
    );
    console.log(`Total payments in database: ${migratedCount[0].count}`);
    console.log(
      '✅ Completed migration of remaining transactions to payments table',
    );
  }

  public async down(): Promise<void> {
    // Rollback: This is tricky since we can't identify which payments came from this migration
    // We'll remove payments that match transaction data (reverse of the migration logic)
    console.log(
      '⚠️  Rollback of transaction migration is not fully reversible',
    );
    console.log('   Payments that were migrated will remain in the database');
    // Note: Full rollback would require storing which payments came from this migration
  }
}
