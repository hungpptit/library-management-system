import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity('Publishers')
export class Publisher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'bigint', nullable: true })
  created_at: number;

  @OneToMany(() => Book, (book) => book.publisher)
  books: Book[];
}
