import { IsNumber, IsPositive, IsOptional } from 'class-validator';

export class PayInvoiceRequestDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
