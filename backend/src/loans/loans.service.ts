import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Loan } from './loan.entity';
import { FineLog } from './finelog.entity';
import { Book } from '../books/book.entity';
import { User } from '../users/user.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

interface ReportDamageOrLossDto {
  loanId: number;
  condition: 'Damaged' | 'Lost';
  overdueDays?: number;
  adminNote?: string;
}

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(FineLog)
    private readonly fineLogRepository: Repository<FineLog>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async syncOverdueStatuses(options?: {
    readerId?: number;
    loanId?: number;
  }): Promise<void> {
    const now = Date.now();
    const query = this.loanRepository
      .createQueryBuilder()
      .update(Loan)
      .set({ status: 'Overdue' })
      .where('status = :status', { status: 'Borrowing' })
      .andWhere('return_date IS NULL')
      .andWhere('due_date < :now', { now });

    if (typeof options?.readerId === 'number') {
      query.andWhere('reader_id = :readerId', { readerId: options.readerId });
    }

    if (typeof options?.loanId === 'number') {
      query.andWhere('id = :loanId', { loanId: options.loanId });
    }

    await query.execute();
  }

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const loan = this.loanRepository.create(createLoanDto);
    return this.loanRepository.save(loan);
  }

  async findAll(): Promise<Loan[]> {
    await this.syncOverdueStatuses();
    return this.loanRepository.find({
      relations: ['book', 'user', 'fineLogs'],
    });
  }

  async findOne(id: number): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['book', 'user', 'fineLogs'],
    });
    if (!loan) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }
    return loan;
  }

  async update(id: number, updateLoanDto: UpdateLoanDto): Promise<Loan> {
    await this.loanRepository.update(id, updateLoanDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const result = await this.loanRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }
    return { success: true, message: 'Loan deleted successfully' };
  }

  async borrow(
    userId: number,
    bookId: number,
    dueDate: number,
  ): Promise<Loan> {
    await this.syncOverdueStatuses({ readerId: userId });

    const reader = await this.userRepository.findOne({ where: { id: userId } });
    if (!reader || reader.role !== 'reader') {
      throw new BadRequestException('Invalid reader');
    }

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book does not exist');
    }

    if (Number(book.available || 0) <= 0) {
      throw new BadRequestException('Book is not available for borrowing');
    }

    const readerOverdueLoan = await this.loanRepository.findOne({
      where: {
        reader_id: userId,
        status: 'Overdue',
      },
    });

    if (readerOverdueLoan) {
      throw new BadRequestException(
        'You still have overdue loan(s). Please return overdue books before borrowing new ones.',
      );
    }

    const sameReaderSameBookLoan = await this.loanRepository.findOne({
      where: {
        reader_id: userId,
        book_id: bookId,
        status: In(['Borrowing', 'Overdue']),
      },
    });

    if (sameReaderSameBookLoan) {
      throw new BadRequestException(
        'You already have an active loan for this book. Please return it before borrowing again.',
      );
    }

    const activeLoan = await this.loanRepository.findOne({
      where: {
        book_id: bookId,
        status: In(['Borrowing', 'Overdue']),
      },
    });

    if (activeLoan) {
      throw new BadRequestException(
        'This book is currently borrowed by another reader.',
      );
    }

    const loan = this.loanRepository.create({
      reader_id: userId,
      book_id: bookId,
      issue_date: Date.now(),
      due_date: dueDate,
      status: 'Borrowing',
    });
    return this.loanRepository.save(loan);
  }

  async returnLoan(id: number): Promise<Loan> {
    const loan = await this.findOne(id);
    loan.return_date = Date.now();
    loan.status = 'Returned';
    loan.return_condition = 'Clean';
    return this.loanRepository.save(loan);
  }

  async getActiveLoans(userId: number): Promise<Loan[]> {
    await this.syncOverdueStatuses({ readerId: userId });
    return this.loanRepository.find({
      where: { reader_id: userId, status: In(['Borrowing', 'Overdue']) },
      order: { due_date: 'ASC' },
      relations: ['book'],
    });
  }

  async searchLoan(loanId: number): Promise<Loan> {
    await this.syncOverdueStatuses({ loanId });

    const loan = await this.loanRepository.findOne({
      where: { id: loanId },
      relations: ['book', 'user', 'fineLogs'],
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${loanId} not found`);
    }

    if (loan.status !== 'Borrowing' && loan.status !== 'Overdue') {
      throw new BadRequestException(
        `Loan #${loanId} is not in Borrowing or Overdue status`,
      );
    }

    return loan;
  }

  async confirmReturnClean(
    loanId: number,
  ): Promise<{ success: boolean; message: string; loan: Loan }> {
    await this.searchLoan(loanId);

    await this.loanRepository.update(loanId, {
      return_date: Date.now(),
      status: 'Returned',
      return_condition: 'Clean',
    });

    const updatedLoan = await this.findOne(loanId);

    return {
      success: true,
      message: 'Book return confirmed as clean',
      loan: updatedLoan,
    };
  }

  async reportDamageOrLoss(returnData: ReportDamageOrLossDto): Promise<{
    loan: Loan;
    fineLogs: FineLog[];
    totalFine: number;
    message: string;
  }> {
    const { loanId, condition, overdueDays = 0, adminNote } = returnData;

    if (condition !== 'Damaged' && condition !== 'Lost') {
      throw new BadRequestException('Condition must be Damaged or Lost');
    }

    const loan = await this.searchLoan(loanId);
    const normalizedOverdueDays = Math.max(0, Number(overdueDays) || 0);
    const bookPrice = Number(loan.book?.price || 0);
    const fineLogsToCreate: Partial<FineLog>[] = [];

    if (normalizedOverdueDays > 0) {
      fineLogsToCreate.push({
        loan_id: loan.id,
        fine_amount: normalizedOverdueDays * (bookPrice * 0.05),
        reason: `Overdue ${normalizedOverdueDays} day(s) - 5% per day`,
        status: 'Pending',
        created_at: Date.now(),
      });
    }
    if (condition === 'Damaged') {
      fineLogsToCreate.push({
        loan_id: loan.id,
        fine_amount: bookPrice * 0.5,
        reason: 'Book damaged',
        status: 'Pending',
        created_at: Date.now(),
      });
    }

    if (condition === 'Lost') {
      fineLogsToCreate.push({
        loan_id: loan.id,
        fine_amount: bookPrice * 1.5,
        reason: 'Book lost',
        status: 'Pending',
        created_at: Date.now(),
      });
    }

    if (adminNote && adminNote.trim()) {
      fineLogsToCreate.push({
        loan_id: loan.id,
        fine_amount: 0,
        reason: `Admin note: ${adminNote.trim()}`,
        status: 'Pending',
        created_at: Date.now(),
      });
    }

    const fineLogs = fineLogsToCreate.length
      ? await this.fineLogRepository.save(
          this.fineLogRepository.create(fineLogsToCreate),
        )
      : [];

    await this.loanRepository.update(loan.id, {
      return_date: Date.now(),
      status: condition,
      return_condition: condition,
    });

    const updatedLoan = await this.findOne(loan.id);
    const totalFine = fineLogs.reduce(
      (sum, item) => sum + Number(item.fine_amount || 0),
      0,
    );

    return {
      loan: updatedLoan,
      fineLogs,
      totalFine,
      message: `Return reported as ${condition}`,
    };
  }

  async getReaderFines(userId: number): Promise<{
    totalFines: number;
    fineDetails: FineLog[];
  }> {
    const loans = await this.loanRepository.find({
      where: { reader_id: userId },
      relations: ['fineLogs'],
    });

    const fineDetails = loans.flatMap((loan) => loan.fineLogs || []);
    const totalFines = fineDetails.reduce(
      (sum, fine) => sum + Number(fine.fine_amount || 0),
      0,
    );

    return {
      totalFines,
      fineDetails,
    };
  }
}
