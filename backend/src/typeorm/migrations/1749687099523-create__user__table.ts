import { MigrationInterface, QueryRunner } from 'typeorm';

export class Create__user__table1749687099523 implements MigrationInterface {
  name = 'Create__user__table1749687099523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "username" VARCHAR(20) NOT NULL,
        "password" VARCHAR(100) NOT NULL,
        
        CONSTRAINT "UQ_user_username" UNIQUE ("username")
      )
    `);

    console.log('✅ User table created');
    console.log('👤 Foundation table for the double-entry bookkeeping system');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    console.log('❌ User table dropped');
  }
}
