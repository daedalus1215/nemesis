import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './domain/entities/payment.entity';
import { PaymentApplication } from './domain/entities/payment-application.entity';
import { PaymentAggregator } from './domain/aggregators/payment.aggregator';
import { PaymentService } from './domain/services/payment.service';
import { PaymentRepository } from './infra/repositories/payment.repository';
import { PaymentApplicationRepository } from './infra/repositories/payment-application.repository';
import { CreatePaymentApplicationTransactionScript } from './domain/transaction-scripts/create-payment-application-TS/create-payment-application.transaction.script';
import { AccountsModule } from '../ledger/accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentApplication]),
    forwardRef(() => AccountsModule),
  ],
  providers: [
    PaymentAggregator,
    PaymentService,
    PaymentRepository,
    PaymentApplicationRepository,
    CreatePaymentApplicationTransactionScript,
    { provide: 'PaymentRepositoryPort', useClass: PaymentRepository },
  ],
  exports: [PaymentAggregator, PaymentService],
})
export class PaymentsModule {}
