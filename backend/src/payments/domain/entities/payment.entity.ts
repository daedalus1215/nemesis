import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const PaymentCategory = {
  POS: 'POS',
  INVOICE_PAYMENT: 'INVOICE_PAYMENT',
  PREPAYMENT: 'PREPAYMENT',
  REFUND: 'REFUND',
  PAYOUT: 'PAYOUT',
  FEE: 'FEE',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;

export type PaymentCategoryType =
  (typeof PaymentCategory)[keyof typeof PaymentCategory];
export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  VOID: 'VOID',
} as const;
export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'debit_account_id', type: 'int' })
  debitAccountId: number;

  @Column({ name: 'credit_account_id', type: 'int' })
  creditAccountId: number;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description: string;

  @Column({ name: 'category', type: 'varchar', length: 50, default: 'POS' })
  category: PaymentCategoryType;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'PENDING' })
  status: PaymentStatusType;

  @Column({ name: 'payer_user_id', type: 'int', nullable: true })
  payerUserId: number;

  @Column({ name: 'payee_user_id', type: 'int', nullable: true })
  payeeUserId: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
