import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialPostgres1786405578632 implements MigrationInterface {
    name = 'InitialPostgres1786405578632'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoices" ("id" SERIAL NOT NULL, "issuer_user_id" integer NOT NULL, "debtor_user_id" integer NOT NULL, "total" numeric(12,2) NOT NULL, "balance_due" numeric(12,2) NOT NULL, "status" character varying(20) NOT NULL, "issue_date" date NOT NULL, "due_date" date NOT NULL, "description" character varying, CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recurring_invoices" ("id" SERIAL NOT NULL, "recurring_invoice_id" character varying NOT NULL, "issuer_user_id" integer NOT NULL, "debtor_user_id" integer NOT NULL, "amount" numeric(12,2) NOT NULL, "parent_invoice_id" integer, "interval_type" character varying NOT NULL, "interval_count" integer NOT NULL DEFAULT '1', "day_of_week" integer, "day_of_month" integer, "month_offset" integer DEFAULT '0', "hour" integer NOT NULL DEFAULT '9', "status" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "next_run" TIMESTAMP WITH TIME ZONE NOT NULL, "last_run" TIMESTAMP WITH TIME ZONE, "last_error" character varying, "description" character varying, "metadata" text, CONSTRAINT "UQ_4a437b11713f4d86c25c73c2b9e" UNIQUE ("recurring_invoice_id"), CONSTRAINT "PK_8a156fda29720c5fc4f86c89081" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_recurring_issuer" ON "recurring_invoices" ("issuer_user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_recurring_parent" ON "recurring_invoices" ("parent_invoice_id") `);
        await queryRunner.query(`CREATE INDEX "idx_recurring_status" ON "recurring_invoices" ("status") `);
        await queryRunner.query(`CREATE INDEX "idx_recurring_created" ON "recurring_invoices" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_recurring_next_run" ON "recurring_invoices" ("next_run") `);
        await queryRunner.query(`CREATE TABLE "payments" ("id" SERIAL NOT NULL, "amount" numeric(12,2) NOT NULL, "debit_account_id" integer NOT NULL, "credit_account_id" integer NOT NULL, "description" character varying, "category" character varying(50) NOT NULL DEFAULT 'POS', "status" character varying(20) NOT NULL DEFAULT 'PENDING', "payer_user_id" integer, "payee_user_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_applications" ("id" SERIAL NOT NULL, "payments_id" integer NOT NULL, "invoices_id" integer NOT NULL, "applied_amount" numeric(12,2) NOT NULL, CONSTRAINT "PK_d42425dbe554ac2fd83203d6121" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_payment_applications_payment_id" ON "payment_applications" ("payments_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_payment_applications_invoice_id" ON "payment_applications" ("invoices_id") `);
        await queryRunner.query(`CREATE TABLE "ledger_transactions" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_633d103c9e415d615aacf9b1929" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying(20) NOT NULL, "password" character varying(100) NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "isDefault" boolean NOT NULL DEFAULT false, "ownerId" integer NOT NULL, "accountType" character varying(20) NOT NULL DEFAULT 'ASSET', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recurring_invoices" ADD CONSTRAINT "fk_recurring_parent" FOREIGN KEY ("parent_invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_applications" ADD CONSTRAINT "FK_payment_applications_invoice" FOREIGN KEY ("invoices_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_applications" ADD CONSTRAINT "FK_payment_applications_payment" FOREIGN KEY ("payments_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_applications" DROP CONSTRAINT "FK_payment_applications_payment"`);
        await queryRunner.query(`ALTER TABLE "payment_applications" DROP CONSTRAINT "FK_payment_applications_invoice"`);
        await queryRunner.query(`ALTER TABLE "recurring_invoices" DROP CONSTRAINT "fk_recurring_parent"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "ledger_transactions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_applications_invoice_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_payment_applications_payment_id"`);
        await queryRunner.query(`DROP TABLE "payment_applications"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recurring_next_run"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recurring_created"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recurring_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recurring_parent"`);
        await queryRunner.query(`DROP INDEX "public"."idx_recurring_issuer"`);
        await queryRunner.query(`DROP TABLE "recurring_invoices"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
    }

}
