import { IsOptional, IsEnum } from 'class-validator';
import { RECURRING_INVOICE_STATUS } from '../../../domain/entities/recurring-invoice.entity';

export class ListRecurringInvoicesRequestDto {
  @IsOptional()
  @IsEnum(RECURRING_INVOICE_STATUS)
  status?: (typeof RECURRING_INVOICE_STATUS)[keyof typeof RECURRING_INVOICE_STATUS];
}
