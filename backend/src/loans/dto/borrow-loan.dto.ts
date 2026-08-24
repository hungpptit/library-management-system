import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class BorrowLoanDto {
  @IsNumber()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Book ID is required' })
  bookId: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty({ message: 'Due date timestamp is required' })
  dueDate: number;
}
