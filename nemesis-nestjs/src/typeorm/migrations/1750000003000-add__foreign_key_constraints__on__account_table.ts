import { MigrationInterface, QueryRunner } from 'typeorm';

export class Add__foreign_key_constraints__on__account_table1750000003000
  implements MigrationInterface
{
  name = 'Add__foreign_key_constraints__on__account_table1750000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add foreign key constraint from account to user
    await queryRunner.query(`
      CREATE TABLE "account_new" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "ownerId" INTEGER NOT NULL,
        "accountType" VARCHAR(20) NOT NULL DEFAULT ('ASSET'),
        "isDefault" BOOLEAN NOT NULL DEFAULT (0),
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        
        CONSTRAINT "FK_account_owner" FOREIGN KEY ("ownerId") 
        REFERENCES "user" ("id") ON DELETE CASCADE
      )
    `);

    // Copy data from old table
    await queryRunner.query(`
      INSERT INTO "account_new" 
      SELECT * FROM "account"
    `);

    // Replace old table
    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`ALTER TABLE "account_new" RENAME TO "account"`);

    console.log('✅ Foreign key constraint added: account.ownerId → user.id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove foreign key constraint
    await queryRunner.query(`
      CREATE TABLE "account_new" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "ownerId" INTEGER NOT NULL,
        "accountType" VARCHAR(20) NOT NULL DEFAULT ('ASSET'),
        "isDefault" BOOLEAN NOT NULL DEFAULT (0),
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )
    `);

    await queryRunner.query(`
      INSERT INTO "account_new" 
      SELECT * FROM "account"
    `);

    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`ALTER TABLE "account_new" RENAME TO "account"`);

    console.log('❌ Foreign key constraint removed');
  }
}
