import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ReportDamageDto {
  @IsNumber()
  @IsOptional()
  loanId?: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Damaged', 'Lost'], { message: 'Condition must be Damaged or Lost' })
  condition: 'Damaged' | 'Lost';

  @IsNumber()
  @Min(0)
  @IsOptional()
  overdueDays?: number;

  @IsString()
  @IsOptional()
  adminNote?: string;
}
