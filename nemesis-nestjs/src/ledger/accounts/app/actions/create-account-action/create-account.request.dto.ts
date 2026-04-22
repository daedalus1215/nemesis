import { IsString, IsOptional, IsEnum, Length } from 'class-validator';

export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'REVENUE'
  | 'EXPENSE';

export class CreateAccountRequestDto {
  @IsString()
  @Length(1, 50)
  name: string;

  @IsOptional()
  @IsEnum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'])
  accountType?: AccountType = 'ASSET';
}
