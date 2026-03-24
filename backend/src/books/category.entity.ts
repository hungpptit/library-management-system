import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Book } from './book.entity';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  location_area: string;

  @Column({ type: 'bigint' })
  created_at: number;

  @OneToMany(() => Book, (book) => book.category)
  books: Book[];
}
