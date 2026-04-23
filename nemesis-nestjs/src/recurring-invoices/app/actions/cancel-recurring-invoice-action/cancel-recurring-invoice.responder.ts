import { Injectable } from '@nestjs/common';
import { RecurringInvoice } from '../../../domain/entities/recurring-invoice.entity';
import { CancelRecurringInvoiceResponseDto } from './cancel-recurring-invoice.response.dto';

@Injectable()
export class CancelRecurringInvoiceResponder {
  apply(entity: RecurringInvoice): CancelRecurringInvoiceResponseDto {
    return {
      recurringInvoiceId: entity.recurringInvoiceId,
      status: entity.status,
      success: true,
    };
  }
}
