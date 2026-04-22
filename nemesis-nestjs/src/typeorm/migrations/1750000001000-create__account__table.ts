import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create__account__table1750000001000 implements MigrationInterface {
  name = 'Create__account__table1750000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Account table with clean structure
    await queryRunner.query(`
      CREATE TABLE "account" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "ownerId" INTEGER NOT NULL,
        "accountType" VARCHAR(20) NOT NULL DEFAULT ('ASSET'),
        "isDefault" BOOLEAN NOT NULL DEFAULT (0),
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )
    `);

    console.log('✅ Account table created');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "account"`);
    console.log('❌ Account table dropped');
  }
}
