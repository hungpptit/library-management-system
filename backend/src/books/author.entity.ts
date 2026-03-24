import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

@Entity('Authors')
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 100 })
  name: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  bio: string;

  @Column({ type: 'bigint' })
  created_at: number;

  @ManyToMany('Book', 'authors')
  books: any[];
}
