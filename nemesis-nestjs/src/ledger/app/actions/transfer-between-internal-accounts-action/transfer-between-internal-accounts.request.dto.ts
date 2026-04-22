import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';

export class TransferBetweenUsersDto {
  @IsInt()
  @IsPositive()
  toUserId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
