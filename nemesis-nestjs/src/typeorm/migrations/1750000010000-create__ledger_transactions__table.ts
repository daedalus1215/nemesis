import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_LedgerTransactions_Table1750000010000
  implements MigrationInterface
{
  name = 'Create_LedgerTransactions_Table1750000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ledger_transactions" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "ledger_transactions"`);
  }
}
