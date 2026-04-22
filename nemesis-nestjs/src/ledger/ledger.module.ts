import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AccountsModule } from './accounts/accounts.module';
import { PaymentsModule } from '../payments/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerTransaction } from './domain/entities/ledger.entity';

@Module({
  imports: [
    UsersModule,
    AccountsModule,
    PaymentsModule,
    TypeOrmModule.forFeature([LedgerTransaction]),
  ],
  providers: [],
  controllers: [],
  exports: [AccountsModule], // Export the accounts module which has all the endpoints
})
export class LedgerModule {}
