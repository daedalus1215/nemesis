import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ledger_transactions' })
export class LedgerTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
