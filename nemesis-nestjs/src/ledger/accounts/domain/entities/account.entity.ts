import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsEnum,
  Length,
  IsDate,
} from 'class-validator';

export const ACCOUNT_TYPE = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE',
} as const;

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

@Entity()
export class Account {
  @PrimaryGeneratedColumn({ type: 'int' })
  @IsNumber()
  id: number;

  @Column({ length: 50 })
  @IsString()
  @IsNotEmpty({ message: 'Account name cannot be empty' })
  @Length(1, 50, {
    message: 'Account name must be between 1 and 50 characters',
  })
  name: string;

  @Column({ default: false })
  @IsBoolean()
  isDefault: boolean;

  // ✅ Reference by ID only - no entity relationship to avoid cross-context coupling
  @Column()
  @IsNumber()
  ownerId: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: ACCOUNT_TYPE.ASSET,
  })
  @IsEnum(Object.values(ACCOUNT_TYPE), {
    message:
      'Account type must be one of: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE',
  })
  accountType: AccountType;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate()
  updatedAt: Date;
}
