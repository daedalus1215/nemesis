import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'payment_applications' })
export class PaymentApplication {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'payments_id', type: 'int' })
  paymentId: number;

  @Column({ name: 'invoices_id', type: 'int' })
  invoiceId: number;

  @Column({
    name: 'applied_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  appliedAmount: number;
}
