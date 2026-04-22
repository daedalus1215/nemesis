import { Injectable } from '@nestjs/common';
import { CreateInvoiceTransactionScript } from '../transaction-scripts/create-invoice-TS/create-invoice.transaction.script';
import { FetchInvoicesTransactionScript } from '../transaction-scripts/fetch-invoices-TS/fetch-invoices.transaction.script';
import { GetInvoiceByIdTransactionScript } from '../transaction-scripts/get-invoice-by-id-TS/get-invoice-by-id.transaction.script';
import { UpdateInvoiceStatusTransactionScript } from '../transaction-scripts/update-invoice-status-TS/update-invoice-status.transaction.script';
import { CancelInvoiceTransactionScript } from '../transaction-scripts/cancel-invoice-TS/cancel-invoice.transaction.script';
import {
  Invoice,
  InvoiceStatusType,
  INVOICE_STATUS,
} from '../entities/invoice.entity';
import { CreateInvoiceRequestDto } from '../../app/actions/create-invoice-action/create-invoice.request.dto';
import { PaymentAggregator } from '../../../payments/domain/aggregators/payment.aggregator';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly createInvoiceTransactionScript: CreateInvoiceTransactionScript,
    private readonly fetchInvoicesTransactionScript: FetchInvoicesTransactionScript,
    private readonly getInvoiceByIdTransactionScript: GetInvoiceByIdTransactionScript,
    private readonly updateInvoiceStatusTransactionScript: UpdateInvoiceStatusTransactionScript,
    private readonly cancelInvoiceTransactionScript: CancelInvoiceTransactionScript,
    private readonly paymentAggregator: PaymentAggregator,
  ) {}

  async createInvoice(
    dto: CreateInvoiceRequestDto,
    issuerUserId: number,
  ): Promise<Invoice> {
    return await this.createInvoiceTransactionScript.execute(dto, issuerUserId);
  }

  async getInvoices(
    userId: number,
    statuses?: InvoiceStatusType[],
  ): Promise<Invoice[]> {
    return await this.fetchInvoicesTransactionScript.execute(userId, statuses);
  }

  async getInvoiceById(invoiceId: number): Promise<Invoice | null> {
    return await this.getInvoiceByIdTransactionScript.execute(invoiceId);
  }

  async applyPaymentToInvoice(
    invoiceId: number,
    paymentAmount: number,
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const newBalanceDue = invoice.balanceDue - paymentAmount;

    if (newBalanceDue < 0) {
      throw new Error(
        `Payment amount (${paymentAmount}) exceeds balance due (${invoice.balanceDue})`,
      );
    }

    // Only mark as PAID if balance reaches zero, otherwise keep current status
    const newStatus =
      newBalanceDue === 0 ? INVOICE_STATUS.PAID : invoice.status;

    return await this.updateInvoiceStatusTransactionScript.execute(
      invoiceId,
      newBalanceDue,
      newStatus,
    );
  }

  async cancelInvoice(
    invoiceId: number,
    issuerUserId: number,
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.issuerUserId !== issuerUserId) {
      throw new Error('Unauthorized: Only the issuer can cancel this invoice');
    }

    if (invoice.status === INVOICE_STATUS.CANCELLED) {
      throw new Error('Invoice is already cancelled');
    }

    const hasPayments =
      await this.paymentAggregator.hasPaymentApplications(invoiceId);
    if (hasPayments) {
      throw new Error(
        'Cannot cancel invoice: Invoice has existing payments applied to it',
      );
    }

    return await this.cancelInvoiceTransactionScript.execute(invoiceId);
  }
}
