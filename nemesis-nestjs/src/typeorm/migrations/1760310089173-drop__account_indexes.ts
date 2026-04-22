import { MigrationInterface, QueryRunner } from 'typeorm';

export class Drop_Account_Indexes1760310089173 implements MigrationInterface {
  name = 'Drop_Account_Indexes1760310089173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_account_owner"`);
    await queryRunner.query(`DROP INDEX "IDX_user_default_account"`);
    await queryRunner.query(`DROP INDEX "IDX_account_type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
