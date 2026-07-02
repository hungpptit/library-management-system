import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Loan } from './loan.entity';

@Entity('Fine_Logs')
export class FineLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  loan_id!: number;

  @ManyToOne(() => Loan, (loan) => loan.fineLogs)
  @JoinColumn({ name: 'loan_id' })
  loan!: Loan;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fine_amount!: number;

  @Column({ length: 255, nullable: true })
  reason?: string;

  @Column({ length: 20, default: 'Pending' })
  status!: string; // Pending, Paid

  @Column({ type: 'bigint' })
  created_at!: number;
}
