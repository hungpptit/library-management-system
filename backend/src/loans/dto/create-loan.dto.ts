export class CreateLoanDto {
  book_id: number;
  reader_id: number;
  issue_date: number;
  due_date: number;
  status?: string;
}
