import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create_Payments_Table1750000011000 implements MigrationInterface {
  name = 'Create_Payments_Table1750000011000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" varchar PRIMARY KEY NOT NULL, "amount" decimal(12,2) NOT NULL, "debitAccountId" integer NOT NULL, "creditAccountId" integer NOT NULL, "description" varchar, "category" varchar(50) NOT NULL DEFAULT ('transfer'), "status" varchar(20) NOT NULL DEFAULT ('PENDING'), "initiatingUserId" integer, "counterpartyUserId" integer, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}
