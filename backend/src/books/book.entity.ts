import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn, JoinTable, DeleteDateColumn } from 'typeorm';
import { Category } from './category.entity';
import { Publisher } from './publisher.entity';
import { Author } from './author.entity';

@Entity('Books')
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 20, nullable: true })
  isbn: string;

  @Column({ nullable: true })
  category_id: number;

  @ManyToOne(() => Category, (category) => category.books)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true })
  publisher_id: number;

  @ManyToOne(() => Publisher, (publisher) => publisher.books)
  @JoinColumn({ name: 'publisher_id' })
  publisher: Publisher;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  available: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  cover_url: string;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ length: 50, nullable: true })
  location: string;

  @Column({ type: 'bigint' })
  created_at: number;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at: Date;

  @ManyToMany(() => Author, (author) => author.books)
  @JoinTable({
    name: 'Book_Authors',
    joinColumn: { name: 'book_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'author_id', referencedColumnName: 'id' },
  })
  authors: Author[];
}
