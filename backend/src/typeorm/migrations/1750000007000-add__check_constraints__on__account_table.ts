import { MigrationInterface, QueryRunner } from 'typeorm';

export class Add__check_constraints__on__account_table1750000007000
  implements MigrationInterface
{
  name = 'Add__check_constraints__on__account_table1750000007000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add business rule constraints to account table
    await queryRunner.query(`
      CREATE TABLE "account_new" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" VARCHAR(50) NOT NULL,
        "ownerId" INTEGER NOT NULL,
        "accountType" VARCHAR(20) NOT NULL DEFAULT ('ASSET'),
        "isDefault" BOOLEAN NOT NULL DEFAULT (0),
        "createdAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updatedAt" DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        
        -- Business rule constraints
        CONSTRAINT "chk_account_name_not_empty" CHECK (LENGTH(TRIM(name)) > 0),
        CONSTRAINT "chk_account_valid_type" CHECK (
          accountType IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')
        ),
        
        -- Foreign key constraint
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

    console.log('✅ Business rule constraints added to account table:');
    console.log('  - Account name cannot be empty');
    console.log('  - Account type must be valid enum value');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove business rule constraints but keep foreign key
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

    await queryRunner.query(`
      INSERT INTO "account_new" 
      SELECT * FROM "account"
    `);

    await queryRunner.query(`DROP TABLE "account"`);
    await queryRunner.query(`ALTER TABLE "account_new" RENAME TO "account"`);

    console.log('❌ Business rule constraints removed from account table');
  }
}
