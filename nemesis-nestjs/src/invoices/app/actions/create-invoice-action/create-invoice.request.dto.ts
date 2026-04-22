import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsInt,
  IsDateString,
} from 'class-validator';

export class CreateInvoiceRequestDto {
  @IsInt()
  @IsPositive()
  debtorUserId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;
}
