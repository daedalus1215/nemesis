import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RecurringInvoice } from './domain/entities/recurring-invoice.entity';
import { RecurringInvoiceRepository } from './infra/repositories/recurring-invoice.repository';
import { CreateRecurringInvoiceTransactionScript } from './domain/transaction-scripts/create-recurring-invoice-TS/create-recurring-invoice.transaction.script';
import { ActivateRecurringInvoiceTransactionScript } from './domain/transaction-scripts/activate-recurring-invoice-TS/activate-recurring-invoice.transaction.script';
import { PauseRecurringInvoiceTransactionScript } from './domain/transaction-scripts/pause-recurring-invoice-TS/pause-recurring-invoice.transaction.script';
import { CancelRecurringInvoiceTransactionScript } from './domain/transaction-scripts/cancel-recurring-invoice-TS/cancel-recurring-invoice.transaction.script';
import { ExecuteScheduleTransactionScript } from './domain/transaction-scripts/execute-schedule-TS/execute-schedule.transaction.script';
import { RecurringInvoiceService } from './domain/services/recurring-invoice.service';
import { RecurringInvoiceAggregator } from './domain/aggregators/recurring-invoice.aggregator';
import { RecurringInvoiceScheduler } from './app/cron/recurring-invoice.scheduler';
import { CreateRecurringInvoiceAction } from './app/actions/create-recurring-invoice-action/create-recurring-invoice.action';
import { CreateRecurringInvoiceResponder } from './app/actions/create-recurring-invoice-action/create-recurring-invoice.responder';
import { ListRecurringInvoicesAction } from './app/actions/list-recurring-invoices-action/list-recurring-invoices.action';
import { ListRecurringInvoicesResponder } from './app/actions/list-recurring-invoices-action/list-recurring-invoices.responder';
import { GetRecurringInvoiceAction } from './app/actions/get-recurring-invoice-action/get-recurring-invoice.action';
import { GetRecurringInvoiceResponder } from './app/actions/get-recurring-invoice-action/get-recurring-invoice.responder';
import { ActivateRecurringInvoiceAction } from './app/actions/activate-recurring-invoice-action/activate-recurring-invoice.action';
import { ActivateRecurringInvoiceResponder } from './app/actions/activate-recurring-invoice-action/activate-recurring-invoice.responder';
import { PauseRecurringInvoiceAction } from './app/actions/pause-recurring-invoice-action/pause-recurring-invoice.action';
import { PauseRecurringInvoiceResponder } from './app/actions/pause-recurring-invoice-action/pause-recurring-invoice.responder';
import { CancelRecurringInvoiceAction } from './app/actions/cancel-recurring-invoice-action/cancel-recurring-invoice.action';
import { CancelRecurringInvoiceResponder } from './app/actions/cancel-recurring-invoice-action/cancel-recurring-invoice.responder';
import { RunDueRecurringInvoicesDebugAction } from './app/actions/run-due-debug-action/run-due-recurring-invoices-debug.action';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringInvoice]),
    ScheduleModule.forRoot(),
    InvoicesModule,
  ],
  providers: [
    RecurringInvoiceRepository,
    CreateRecurringInvoiceTransactionScript,
    ActivateRecurringInvoiceTransactionScript,
    PauseRecurringInvoiceTransactionScript,
    CancelRecurringInvoiceTransactionScript,
    ExecuteScheduleTransactionScript,
    RecurringInvoiceService,
    RecurringInvoiceAggregator,
    RecurringInvoiceScheduler,
    CreateRecurringInvoiceResponder,
    ListRecurringInvoicesResponder,
    GetRecurringInvoiceResponder,
    ActivateRecurringInvoiceResponder,
    PauseRecurringInvoiceResponder,
    CancelRecurringInvoiceResponder,
  ],
  controllers: [
    CreateRecurringInvoiceAction,
    ListRecurringInvoicesAction,
    GetRecurringInvoiceAction,
    ActivateRecurringInvoiceAction,
    PauseRecurringInvoiceAction,
    CancelRecurringInvoiceAction,
    RunDueRecurringInvoicesDebugAction,
  ],
  exports: [RecurringInvoiceService],
})
export class RecurringInvoicesModule {}
