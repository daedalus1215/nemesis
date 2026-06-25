import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from '../../../invoices/domain/entities/invoice.entity';

@Entity({ name: 'payment_applications' })
export class PaymentApplication {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Index('IDX_payment_applications_payment_id')
  @Column({ name: 'payments_id', type: 'int' })
  paymentId: number;

  @Index('IDX_payment_applications_invoice_id')
  @Column({ name: 'invoices_id', type: 'int' })
  invoiceId: number;

  // Relation order matters: TypeORM emits FOREIGN KEY constraints in
  // declaration order, and the live schema lists the invoices FK first.
  // The constraint names must match those stored in the table's CREATE SQL,
  // otherwise migration:generate keeps emitting a no-op table rebuild.
  @ManyToOne(() => Invoice, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'invoices_id',
    foreignKeyConstraintName: 'FK_payment_applications_invoice',
  })
  invoice?: Invoice;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'payments_id',
    foreignKeyConstraintName: 'FK_payment_applications_payment',
  })
  payment?: Payment;

  @Column({
    name: 'applied_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  appliedAmount: number;
}
