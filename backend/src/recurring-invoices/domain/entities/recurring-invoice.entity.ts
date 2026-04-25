import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const RECURRING_INVOICE_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type RecurringInvoiceStatusType =
  (typeof RECURRING_INVOICE_STATUS)[keyof typeof RECURRING_INVOICE_STATUS];

export const INTERVAL_TYPE = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
} as const;

export type IntervalTypeValue = (typeof INTERVAL_TYPE)[keyof typeof INTERVAL_TYPE];

@Entity({ name: 'recurring_invoices' })
export class RecurringInvoice {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'recurring_invoice_id', type: 'varchar', unique: true })
  recurringInvoiceId: string;

  @Column({ name: 'issuer_user_id', type: 'int' })
  issuerUserId: number;

  @Column({ name: 'debtor_user_id', type: 'int' })
  debtorUserId: number;

  @Column({ name: 'amount', type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'parent_invoice_id', nullable: true, type: 'int' })
  parentInvoiceId?: number;

  @Column({ name: 'interval_type', type: 'varchar' })
  intervalType: IntervalTypeValue;

  @Column({ name: 'interval_count', type: 'int', default: 1 })
  intervalCount: number;

  @Column({ name: 'day_of_week', nullable: true, type: 'int' })
  dayOfWeek?: number;

  @Column({ name: 'day_of_month', nullable: true, type: 'int' })
  dayOfMonth?: number;

  @Column({ name: 'month_offset', nullable: true, type: 'int', default: 0 })
  monthOffset?: number;

  @Column({ name: 'hour', type: 'int', default: 9 })
  hour: number;

  @Column({ name: 'status', type: 'varchar' })
  status: RecurringInvoiceStatusType;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'next_run', type: 'datetime' })
  nextRun: Date;

  @Column({ name: 'last_run', nullable: true, type: 'datetime' })
  lastRun?: Date;

  @Column({ name: 'last_error', nullable: true, type: 'varchar' })
  lastError?: string;

  @Column({ name: 'description', nullable: true, type: 'varchar' })
  description?: string;

  @Column({ name: 'metadata', type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown>;
}
