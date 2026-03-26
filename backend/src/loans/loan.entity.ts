import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Book } from '../books/book.entity';
import { User } from '../users/user.entity';

@Entity('Loans')
export class Loan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  book_id!: number;

  @ManyToOne(() => Book)
  @JoinColumn({ name: 'book_id' })
  book!: Book;

  @Column()
  reader_id!: number;

  @ManyToOne('User', 'loans')
  @JoinColumn({ name: 'reader_id' })
  user!: any;

  @Column({ type: 'bigint' })
  issue_date!: number;

  @Column({ type: 'bigint' })
  due_date!: number;

  @Column({ type: 'bigint', nullable: true })
  return_date?: number;

  @Column({ type: 'nvarchar', length: 20, default: 'Borrowing' })
  status!: string; // Borrowing, Returned, Overdue, Lost

  @OneToMany('FineLog', 'loan')
  fineLogs!: any[];
}
