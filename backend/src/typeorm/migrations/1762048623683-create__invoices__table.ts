import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_Invoices_Table1762048623683 implements MigrationInterface {
  name = 'Create_Invoices_Table1762048623683';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "invoices" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "issuer_user_id" integer NOT NULL, "debtor_user_id" integer NOT NULL, "total" decimal(12,2) NOT NULL, "balance_due" decimal(12,2) NOT NULL, "status" varchar(20) NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "invoices"`);
  }
}
