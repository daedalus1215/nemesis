import { MigrationInterface, QueryRunner } from 'typeorm';

export class Remove_AccountNameConstraint_Table1750000013000
  implements MigrationInterface
{
  name = 'Remove_AccountNameConstraint_Table1750000013000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing indexes
    await queryRunner.query(`DROP INDEX "IDX_account_type"`);
    await queryRunner.query(`DROP INDEX "IDX_user_default_account"`);
    await queryRunner.query(`DROP INDEX "IDX_account_owner"`);

    // Create temporary table without any check constraints
    await queryRunner.query(
      `CREATE TABLE "temporary_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(50) NOT NULL, "ownerId" integer NOT NULL, "accountType" varchar(20) NOT NULL DEFAULT ('ASSET'), "isDefault" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );

    // Copy data from original table
    await queryRunner.query(
      `INSERT INTO "temporary_account"("id", "name", "ownerId", "accountType", "isDefault", "createdAt", "updatedAt") SELECT "id", "name", "ownerId", "accountType", "isDefault", "createdAt", "updatedAt" FROM "account"`,
    );

    // Drop original table and rename temporary table
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_account" RENAME TO "account"`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_account_type" ON "account" ("accountType") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_default_account" ON "account" ("ownerId") WHERE "isDefault" = 1`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_account_owner" ON "account" ("ownerId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_account_type"`);
    await queryRunner.query(`DROP INDEX "IDX_user_default_account"`);
    await queryRunner.query(`DROP INDEX "IDX_account_owner"`);

    // Create temporary table with chk_account_name_not_empty constraint restored
    await queryRunner.query(
      `CREATE TABLE "temporary_account" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(50) NOT NULL, "ownerId" integer NOT NULL, "accountType" varchar(20) NOT NULL DEFAULT ('ASSET'), "isDefault" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "chk_account_name_not_empty" CHECK ((LENGTH(TRIM(name)) > 0)))`,
    );

    // Copy data back
    await queryRunner.query(
      `INSERT INTO "temporary_account"("id", "name", "ownerId", "accountType", "isDefault", "createdAt", "updatedAt") SELECT "id", "name", "ownerId", "accountType", "isDefault", "createdAt", "updatedAt" FROM "account"`,
    );

    // Drop table and rename
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_account" RENAME TO "account"`,
    );

    // Recreate indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_account_type" ON "account" ("accountType") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_default_account" ON "account" ("ownerId") WHERE "isDefault" = 1`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_account_owner" ON "account" ("ownerId") `,
    );
  }
}
