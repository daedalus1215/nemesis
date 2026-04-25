import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './domain/entities/account.entity';
import { Payment } from '../../payments/domain/entities/payment.entity';
import { AccountRepository } from './infra/repositories/account.repository';
import { AccountService } from './domain/services/account-service/account.service';
import { AccountAggregator } from './domain/aggregators/account.aggregator';
import { AccountBalanceService } from './domain/services/account-balance.service';
import { SystemAccountService } from './domain/services/system-account.service';
import { UsersModule } from '../../users/users.module';
import { PaymentsModule } from '../../payments/payment.module';
import { CreateAccountAction } from './app/actions/create-account-action/create-account.action';
import { GetUserAccountsAction } from './app/actions/fetch-user-accounts-action/fetch-user-accounts.action';
import { SetDefaultAccountAction } from './app/actions/set-default-account-action/set-default-account.action';
import { FetchUserBalanceAction } from '../app/actions/fetch-user-balance-action/fetch-user-balance.action';
import { FetchAccountBalanceAction } from './app/actions/fetch-account-balance-action/fetch-account-balance.action';
import { TransferBetweenExternalAccountsAction } from '../app/actions/transfer-between-external-accounts-action/transfer-between-external-accounts.action';
import { FetchAccountPaymentHistoryAction } from '../app/actions/fetch-account-payment-history-action/fetch-account-payment-history.action';
import { FetchUserAccountsResponder } from './app/actions/fetch-user-accounts-action/fetch-user-accounts.responder';
// Transaction Scripts
import { GetUserAccountsTransactionScript } from './domain/transaction-scripts/get-user-accounts-TS/get-user-accounts.transaction.script';
import { GetAccountByIdTransactionScript } from './domain/transaction-scripts/get-account-by-id-TS/get-account-by-id.transaction.script';
import { CreateAccountTransactionScript } from './domain/transaction-scripts/create-account-TS/create-account.transaction.script';
import { SetDefaultAccountTransactionScript } from './domain/transaction-scripts/set-default-account-TS/set-default-account.transaction.script';
import { EnsureUserHasDefaultAccountInvariant } from './domain/invariants/ensure-user-has-default-account-invariant/ensure-user-has-default-account.invariant';
import { GetAccountByIdWithoutOwnershipTransactionScript } from './domain/transaction-scripts/get-account-by-id-without-ownership-TS/get-account-by-id-without-ownership.transaction.script';
import { FetchUserAccountByIdAction } from './app/actions/fetch-account-by-id-action/fetch-account-by-id.action';
import { TransferBetweenInternalAccountsAction } from '../app/actions/transfer-between-internal-accounts-action/transfer-between-internal-accounts.action';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Payment]),
    UsersModule, // For UserAggregator
    forwardRef(() => PaymentsModule), // Import PaymentsModule to get PaymentAggregator and PaymentService
  ],
  providers: [
    AccountRepository,
    { provide: 'AccountRepositoryPort', useClass: AccountRepository },
    GetUserAccountsTransactionScript,
    GetAccountByIdTransactionScript,
    CreateAccountTransactionScript,
    SetDefaultAccountTransactionScript,
    EnsureUserHasDefaultAccountInvariant,
    GetAccountByIdWithoutOwnershipTransactionScript,
    AccountService,
    AccountAggregator,
    AccountBalanceService,
    SystemAccountService, // Added for system account management
    FetchUserAccountsResponder,
  ],
  controllers: [
    CreateAccountAction,
    GetUserAccountsAction,
    SetDefaultAccountAction,
    FetchUserBalanceAction,
    FetchAccountBalanceAction,
    FetchUserAccountByIdAction,
    TransferBetweenExternalAccountsAction,
    TransferBetweenInternalAccountsAction,
    FetchAccountPaymentHistoryAction,
  ],
  exports: [AccountAggregator],
})
export class AccountsModule {}
