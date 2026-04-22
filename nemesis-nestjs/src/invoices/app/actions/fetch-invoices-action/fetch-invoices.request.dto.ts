import { IsOptional, IsArray, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import {
  INVOICE_STATUS,
  InvoiceStatusType,
} from '../../../domain/entities/invoice.entity';

export class FetchInvoicesRequestDto {
  @IsOptional()
  @IsArray()
  @IsEnum(INVOICE_STATUS, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').filter(Boolean);
    }
    if (Array.isArray(value)) {
      return value;
    }
    return [];
  })
  statuses?: InvoiceStatusType[];
}
