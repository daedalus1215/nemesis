import { Injectable } from '@nestjs/common';
import { RecurringInvoice } from '../../../domain/entities/recurring-invoice.entity';
import { GetRecurringInvoiceResponseDto } from './get-recurring-invoice.response.dto';

@Injectable()
export class GetRecurringInvoiceResponder {
  apply(entity: RecurringInvoice): GetRecurringInvoiceResponseDto {
    return {
      recurringInvoice: {
        id: entity.id,
        recurringInvoiceId: entity.recurringInvoiceId,
        issuerUserId: entity.issuerUserId,
        debtorUserId: entity.debtorUserId,
        amount: entity.amount,
        intervalType: entity.intervalType,
        intervalCount: entity.intervalCount,
        dayOfWeek: entity.dayOfWeek,
        dayOfMonth: entity.dayOfMonth,
        hour: entity.hour,
        status: entity.status,
        nextRun: entity.nextRun.toISOString(),
        lastRun: entity.lastRun?.toISOString(),
        lastError: entity.lastError,
        description: entity.description,
        createdAt: entity.createdAt.toISOString(),
      },
      success: true,
    };
  }
}
