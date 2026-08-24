import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, IsNumber, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Display name is required' })
  display_name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'reader'], { message: 'Role must be either admin or reader' })
  role?: string;

  @IsString()
  @IsOptional()
  student_id?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  card_expiry?: number;

  @IsNumber()
  @IsOptional()
  cardExpiry?: number;
}
