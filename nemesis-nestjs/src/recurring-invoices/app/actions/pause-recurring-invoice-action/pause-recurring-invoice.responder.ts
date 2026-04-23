import { Injectable } from '@nestjs/common';
import { RecurringInvoice } from '../../../domain/entities/recurring-invoice.entity';
import { PauseRecurringInvoiceResponseDto } from './pause-recurring-invoice.response.dto';

@Injectable()
export class PauseRecurringInvoiceResponder {
  apply(entity: RecurringInvoice): PauseRecurringInvoiceResponseDto {
    return {
      recurringInvoiceId: entity.recurringInvoiceId,
      status: entity.status,
      success: true,
    };
  }
}
