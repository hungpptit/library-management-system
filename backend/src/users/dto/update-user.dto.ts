import { IsEmail, IsOptional, IsString, IsIn, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  display_name?: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'reader'], { message: 'Role must be either admin or reader' })
  role?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'deleted'], { message: 'Status must be active or deleted' })
  status?: string;

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
