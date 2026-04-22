import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrate_TransactionsToPayments1760316123000
  implements MigrationInterface
{
  name = 'Migrate_TransactionsToPayments1760316123000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, let's check if there are any transactions to migrate
    const transactionCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "transaction"`,
    );
    console.log(`Found ${transactionCount[0].count} transactions to migrate`);

    if (transactionCount[0].count === 0) {
      console.log('No transactions to migrate, skipping data migration');
      return;
    }

    // Migrate data from transaction table to payments table
    // Handle schema differences:
    // 1. Amount precision: DECIMAL(20,8) -> decimal(12,2) (round to 2 decimal places)
    // 2. Status mapping: 'CANCELLED' -> 'VOID'
    // 3. Category mapping: map old categories to new ones
    // 4. Skip transactions that already exist in payments (idempotent migration)
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
                ROUND(t."amount", 2) as "amount",  -- Round to 2 decimal places
                t."debitAccountId",
                t."creditAccountId",
                t."description",
                CASE 
                    WHEN t."category" = 'transfer' THEN 'POS'
                    WHEN t."category" = 'payment' THEN 'INVOICE_PAYMENT'
                    WHEN t."category" = 'fee' THEN 'FEE'
                    WHEN t."category" = 'interest' THEN 'ADJUSTMENT'
                    WHEN t."category" = 'adjustment' THEN 'ADJUSTMENT'
                    ELSE 'POS'  -- Default fallback
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
                SELECT 1 FROM "payments" p WHERE p."id" = t."id"
            )
        `);

    // Verify the migration
    const migratedCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "payments"`,
    );
    console.log(`Successfully migrated ${migratedCount[0].count} payments`);

    // Show sample of migrated data for verification
    const sampleData = await queryRunner.query(`
            SELECT 
                "id",
                "amount",
                "category",
                "status",
                "description"
            FROM "payments" 
            LIMIT 3
        `);
    console.log('Sample migrated data:', sampleData);

    console.log('Transaction data successfully migrated to payments table');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove migrated data from payments table
    // Note: This assumes we're migrating all transactions, not just some
    const paymentCount = await queryRunner.query(
      `SELECT COUNT(*) as count FROM "payments"`,
    );
    console.log(`Found ${paymentCount[0].count} payments to remove`);

    if (paymentCount[0].count === 0) {
      console.log('No payments to remove, skipping rollback');
      return;
    }

    // Remove all payments (assuming they were all migrated from transactions)
    await queryRunner.query(`DELETE FROM "payments"`);

    console.log('Migrated payment data removed (rollback completed)');
  }
}
