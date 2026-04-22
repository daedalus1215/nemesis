import { Injectable } from '@nestjs/common';
import { InvoiceService } from '../../domain/services/invoice.service';
import { PaymentService } from 'src/payments/domain/services/payment.service';
import { INVOICE_STATUS } from '../../domain/entities/invoice.entity';

@Injectable()
export class InvoiceAppService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
  ) {}

  async payInvoice(
    invoiceId: number,
    paymentAmount: number | undefined,
    debtorUserId: number,
  ): Promise<{ paymentId: number; success: boolean }> {
    // Get the invoice
    const invoice = await this.invoiceService.getInvoiceById(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Verify the user is the debtor
    if (invoice.debtorUserId !== debtorUserId) {
      throw new Error('Unauthorized: You are not the debtor for this invoice');
    }

    // Verify invoice can be paid
    if (invoice.status === INVOICE_STATUS.PAID) {
      throw new Error('Invoice has already been paid');
    }

    if (invoice.balanceDue <= 0) {
      throw new Error('Invoice has no balance due');
    }

    // If no amount specified, default to full balance
    const amountToPay = paymentAmount ?? invoice.balanceDue;

    if (amountToPay <= 0) {
      throw new Error('Payment amount must be positive');
    }

    if (amountToPay > invoice.balanceDue) {
      throw new Error(
        `Payment amount (${amountToPay}) cannot exceed balance due (${invoice.balanceDue})`,
      );
    }

    // Create payment application to link payment to invoice
    const paymentApplicationToInvoice =
      await this.paymentService.createPaymentApplication(invoice, amountToPay);

    // Update invoice balance and status (will only mark as PAID if balance reaches 0)
    await this.invoiceService.applyPaymentToInvoice(invoice.id, amountToPay);

    return {
      paymentId: paymentApplicationToInvoice.paymentId,
      success: true,
    };
  }
}
