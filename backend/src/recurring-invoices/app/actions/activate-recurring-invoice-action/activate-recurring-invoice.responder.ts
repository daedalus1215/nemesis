import { Injectable } from '@nestjs/common';
import { RecurringInvoice } from '../../../domain/entities/recurring-invoice.entity';
import { ActivateRecurringInvoiceResponseDto } from './activate-recurring-invoice.response.dto';

@Injectable()
export class ActivateRecurringInvoiceResponder {
  apply(entity: RecurringInvoice): ActivateRecurringInvoiceResponseDto {
    return {
      recurringInvoiceId: entity.recurringInvoiceId,
      status: entity.status,
      nextRun: entity.nextRun.toISOString(),
      success: true,
    };
  }
}
