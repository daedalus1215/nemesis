import { Injectable } from '@nestjs/common';
import { PayInvoiceResponseDto } from './pay-invoice.response.dto';

@Injectable()
export class PayInvoiceResponder {
  public apply(result: {
    paymentId: number;
    success: boolean;
  }): PayInvoiceResponseDto {
    return {
      paymentId: result.paymentId,
      success: result.success,
    };
  }
}
