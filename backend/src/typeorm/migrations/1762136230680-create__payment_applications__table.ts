import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_PaymentApplications_Table1762136230680
  implements MigrationInterface
{
  name = 'Create_PaymentApplications_Table1762136230680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_applications" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "payments_id" integer NOT NULL,
        "invoices_id" integer NOT NULL,
        "applied_amount" decimal(12,2) NOT NULL,
        CONSTRAINT "FK_payment_applications_payment" FOREIGN KEY ("payments_id") 
        REFERENCES "payments" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payment_applications_invoice" FOREIGN KEY ("invoices_id") 
        REFERENCES "invoices" ("id") ON DELETE CASCADE
      )`,
    );

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_applications_payment_id" ON "payment_applications" ("payments_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_applications_invoice_id" ON "payment_applications" ("invoices_id")`,
    );

    console.log('✅ Created payment_applications table with foreign keys');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_applications_invoice_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_applications_payment_id"`,
    );
    await queryRunner.query(`DROP TABLE "payment_applications"`);

    console.log('❌ Dropped payment_applications table');
  }
}
