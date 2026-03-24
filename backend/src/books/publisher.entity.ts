import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity('Publishers')
export class Publisher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone: string;

  @OneToMany(() => Book, (book) => book.publisher)
  books: Book[];
}
