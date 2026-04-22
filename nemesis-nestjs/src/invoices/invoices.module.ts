import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './domain/entities/invoice.entity';
import { InvoiceRepository } from './infra/repositories/invoice.repository';
import { InvoiceService } from './domain/services/invoice.service';
import { CreateInvoiceTransactionScript } from './domain/transaction-scripts/create-invoice-TS/create-invoice.transaction.script';
import { FetchInvoicesTransactionScript } from './domain/transaction-scripts/fetch-invoices-TS/fetch-invoices.transaction.script';
import { GetInvoiceByIdTransactionScript } from './domain/transaction-scripts/get-invoice-by-id-TS/get-invoice-by-id.transaction.script';
import { UpdateInvoiceStatusTransactionScript } from './domain/transaction-scripts/update-invoice-status-TS/update-invoice-status.transaction.script';
import { CreateInvoiceAction } from './app/actions/create-invoice-action/create-invoice.action';
import { CreateInvoiceResponder } from './app/actions/create-invoice-action/create-invoice.responder';
import { FetchInvoicesAction } from './app/actions/fetch-invoices-action/fetch-invoices.action';
import { FetchInvoicesResponder } from './app/actions/fetch-invoices-action/fetch-invoices.responder';
import { FetchInvoiceByIdAction } from './app/actions/fetch-invoice-by-id-action/fetch-invoice-by-id.action';
import { FetchInvoiceByIdResponder } from './app/actions/fetch-invoice-by-id-action/fetch-invoice-by-id.responder';
import { PayInvoiceAction } from './app/actions/pay-invoice-action/pay-invoice.action';
import { PayInvoiceResponder } from './app/actions/pay-invoice-action/pay-invoice.responder';
import { CancelInvoiceAction } from './app/actions/cancel-invoice-action/cancel-invoice.action';
import { CancelInvoiceResponder } from './app/actions/cancel-invoice-action/cancel-invoice.responder';
import { InvoiceAppService } from './app/app-service/invoice.app.service';
import { PaymentsModule } from '../payments/payment.module';
import { CancelInvoiceTransactionScript } from './domain/transaction-scripts/cancel-invoice-TS/cancel-invoice.transaction.script';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice]), PaymentsModule],
  providers: [
    InvoiceRepository,
    CreateInvoiceTransactionScript,
    FetchInvoicesTransactionScript,
    GetInvoiceByIdTransactionScript,
    UpdateInvoiceStatusTransactionScript,
    CancelInvoiceTransactionScript,
    InvoiceService,
    InvoiceAppService,
    CreateInvoiceResponder,
    FetchInvoicesResponder,
    FetchInvoiceByIdResponder,
    PayInvoiceResponder,
    CancelInvoiceResponder,
  ],
  controllers: [
    CreateInvoiceAction,
    FetchInvoicesAction,
    FetchInvoiceByIdAction,
    PayInvoiceAction,
    CancelInvoiceAction,
  ],
  exports: [InvoiceService],
})
export class InvoicesModule {}
