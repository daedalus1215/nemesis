import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerModule } from './ledger/ledger.module';
import { AccountsModule } from './ledger/accounts/accounts.module';
import { PaymentsModule } from './payments/payment.module';
import { InvoicesModule } from './invoices/invoices.module';
import { RecurringInvoicesModule } from './recurring-invoices/recurring-invoices.module';
import * as Joi from 'joi';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      validationSchema: Joi.object({
        // Postgres replaces the single DATABASE file path (D5/D21). Validated here so a
        // missing value fails at boot with a clear message, not at first query.
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        COOKIE_KEY: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        ALLOW_RECURRING_INVOICE_DEBUG: Joi.string().optional(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') ?? 5432,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/typeorm/migrations/*{.ts,.js}'],
        // The container migrates itself on boot. Without this, a fresh Postgres has no
        // schema and the app starts against nothing.
        // ⚠️ This also means DEPLOYING IS MIGRATING — see setup/08.
        migrationsRun: true,
        synchronize: true,
        // `logging: true` logs every query. Fine while developing, unusable in production
        // where it fills the disk and buries real errors.
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AccountsModule,
    PaymentsModule,
    LedgerModule,
    InvoicesModule,
    RecurringInvoicesModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
