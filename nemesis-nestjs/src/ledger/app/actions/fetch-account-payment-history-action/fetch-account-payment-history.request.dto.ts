import { IsOptional, IsInt, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FetchPaymentHistoryRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
