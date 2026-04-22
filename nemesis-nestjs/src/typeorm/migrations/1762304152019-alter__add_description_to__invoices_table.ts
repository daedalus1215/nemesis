import { MigrationInterface, QueryRunner } from 'typeorm';

export class Alter_AddDescriptionTo_InvoicesTable1762304152019
  implements MigrationInterface
{
  name = 'Alter_AddDescriptionTo_InvoicesTable1762304152019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "temporary_invoices" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "issuer_user_id" integer NOT NULL, "debtor_user_id" integer NOT NULL, "total" decimal(12,2) NOT NULL, "balance_due" decimal(12,2) NOT NULL, "status" varchar(20) NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL, "description" varchar)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_invoices"("id", "issuer_user_id", "debtor_user_id", "total", "balance_due", "status", "issue_date", "due_date") SELECT "id", "issuer_user_id", "debtor_user_id", "total", "balance_due", "status", "issue_date", "due_date" FROM "invoices"`,
    );
    await queryRunner.query(`DROP TABLE "invoices"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_invoices" RENAME TO "invoices"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" RENAME TO "temporary_invoices"`,
    );
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "issuer_user_id" integer NOT NULL, "debtor_user_id" integer NOT NULL, "total" decimal(12,2) NOT NULL, "balance_due" decimal(12,2) NOT NULL, "status" varchar(20) NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL)`,
    );
    await queryRunner.query(
      `INSERT INTO "invoices"("id", "issuer_user_id", "debtor_user_id", "total", "balance_due", "status", "issue_date", "due_date") SELECT "id", "issuer_user_id", "debtor_user_id", "total", "balance_due", "status", "issue_date", "due_date" FROM "temporary_invoices"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_invoices"`);
  }
}
