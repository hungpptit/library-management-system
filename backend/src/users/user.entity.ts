import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'nvarchar', length: 100 })
  display_name!: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  student_id?: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  address?: string;

  @Column({ type: 'nvarchar', length: 20, default: 'reader' })
  role!: string; // admin, reader

  @Column({ type: 'nvarchar', length: 10, default: 'active' })
  status!: string; // active, deleted

  @Column({ type: 'nvarchar', length: 255 })
  password!: string;

  @Column({ type: 'bigint' })
  created_at!: number;

  @OneToMany('Loan', 'user')
  loans!: any[];
}
