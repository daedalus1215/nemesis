import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rebuilds `payment_applications` so its FOREIGN KEY clauses are stored on a
 * single line. The original create migration split each FK across two lines,
 * which TypeORM's SQLite schema parser fails to read back — causing
 * `migration:generate` to emit a spurious no-op table rebuild on every run.
 *
 * This migration is a pure reformat: columns, data, indexes, FK targets and
 * ON DELETE behaviour are all unchanged. After it runs, the entity metadata
 * and the database schema agree and `migration:generate` reports no changes.
 */
export class Normalize_PaymentApplications_ForeignKeys1782354300000
  implements MigrationInterface
{
  name = 'Normalize_PaymentApplications_ForeignKeys1782354300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_payment_applications_invoice_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_payment_applications_payment_id"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_payment_applications" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "payments_id" integer NOT NULL, "invoices_id" integer NOT NULL, "applied_amount" decimal(12,2) NOT NULL, CONSTRAINT "FK_payment_applications_invoice" FOREIGN KEY ("invoices_id") REFERENCES "invoices" ("id") ON DELETE CASCADE, CONSTRAINT "FK_payment_applications_payment" FOREIGN KEY ("payments_id") REFERENCES "payments" ("id") ON DELETE CASCADE)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_payment_applications"("id", "payments_id", "invoices_id", "applied_amount") SELECT "id", "payments_id", "invoices_id", "applied_amount" FROM "payment_applications"`,
    );
    await queryRunner.query(`DROP TABLE "payment_applications"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_payment_applications" RENAME TO "payment_applications"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_applications_invoice_id" ON "payment_applications" ("invoices_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_applications_payment_id" ON "payment_applications" ("payments_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_payment_applications_payment_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_payment_applications_invoice_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_applications" RENAME TO "temporary_payment_applications"`,
    );
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
    await queryRunner.query(
      `INSERT INTO "payment_applications"("id", "payments_id", "invoices_id", "applied_amount") SELECT "id", "payments_id", "invoices_id", "applied_amount" FROM "temporary_payment_applications"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_payment_applications"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_applications_payment_id" ON "payment_applications" ("payments_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payment_applications_invoice_id" ON "payment_applications" ("invoices_id")`,
    );
  }
}
