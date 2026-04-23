import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_Recurring_Invoices_Table1763827200000
  implements MigrationInterface
{
  name = 'Create_Recurring_Invoices_Table1763827200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "recurring_invoices" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "recurring_invoice_id" varchar NOT NULL UNIQUE,
        "issuer_user_id" integer NOT NULL,
        "debtor_user_id" integer NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "parent_invoice_id" integer,
        "interval_type" varchar NOT NULL,
        "interval_count" integer NOT NULL DEFAULT 1,
        "day_of_week" integer,
        "day_of_month" integer,
        "month_offset" integer DEFAULT 0,
        "hour" integer NOT NULL DEFAULT 9,
        "status" varchar NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "next_run" datetime NOT NULL,
        "last_run" datetime,
        "last_error" varchar,
        "description" varchar,
        "metadata" text,
        CONSTRAINT "fk_recurring_parent" FOREIGN KEY ("parent_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "idx_recurring_next_run" ON "recurring_invoices" ("next_run")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_recurring_status" ON "recurring_invoices" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_recurring_parent" ON "recurring_invoices" ("parent_invoice_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_recurring_created" ON "recurring_invoices" ("created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_recurring_issuer" ON "recurring_invoices" ("issuer_user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_recurring_issuer"`);
    await queryRunner.query(`DROP INDEX "idx_recurring_created"`);
    await queryRunner.query(`DROP INDEX "idx_recurring_parent"`);
    await queryRunner.query(`DROP INDEX "idx_recurring_status"`);
    await queryRunner.query(`DROP INDEX "idx_recurring_next_run"`);
    await queryRunner.query(`DROP TABLE "recurring_invoices"`);
  }
}
