import { Injectable } from '@nestjs/common';
import { RecurringInvoice } from '../../../domain/entities/recurring-invoice.entity';
import { CreateRecurringInvoiceResponseDto } from './create-recurring-invoice.response.dto';

@Injectable()
export class CreateRecurringInvoiceResponder {
  apply(entity: RecurringInvoice): CreateRecurringInvoiceResponseDto {
    return {
      recurringInvoiceId: entity.recurringInvoiceId,
      status: entity.status,
      nextRun: entity.nextRun.toISOString(),
      success: true,
    };
  }
}
