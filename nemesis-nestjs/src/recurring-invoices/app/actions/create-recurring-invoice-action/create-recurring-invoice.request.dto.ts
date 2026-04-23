import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { INTERVAL_TYPE } from '../../../domain/entities/recurring-invoice.entity';

export class CreateRecurringInvoiceRequestDto {
  @IsInt()
  @IsPositive()
  debtorUserId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsEnum(INTERVAL_TYPE)
  intervalType: (typeof INTERVAL_TYPE)[keyof typeof INTERVAL_TYPE];

  @IsOptional()
  @IsInt()
  @Min(1)
  intervalCount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(11)
  monthOffset?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  hour?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
