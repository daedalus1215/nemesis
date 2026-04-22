import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

export type InvoiceStatusType =
  (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

@Entity({ name: 'invoices' })
export class Invoice {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'issuer_user_id', type: 'int' })
  issuerUserId: number;

  @Column({ name: 'debtor_user_id', type: 'int' })
  debtorUserId: number;

  @Column({ name: 'total', type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 12, scale: 2 })
  balanceDue: number;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: InvoiceStatusType;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'description', type: 'varchar', nullable: true })
  description?: string;
}
