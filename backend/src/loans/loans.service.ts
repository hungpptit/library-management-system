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
  private readonly activeLoanStatuses = ['Pending', 'Borrowing', 'Overdue'] as const;
  private readonly maxActiveLoansPerReader = 5;

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

  private async validateReaderEligibility(
    readerId: number,
    options?: { excludeLoanId?: number },
  ): Promise<void> {
    const reader = await this.userRepository.findOne({ where: { id: readerId } });
    if (!reader || reader.role !== 'reader') {
      throw new BadRequestException('Tài khoản độc giả không hợp lệ.');
    }

    if (reader.status !== 'active') {
      throw new BadRequestException('Tài khoản reader đang bị khóa hoặc không hoạt động.');
    }

    const now = Date.now();
    if (!reader.card_expiry || Number(reader.card_expiry) < now) {
      throw new BadRequestException('Thẻ thư viện đã hết hạn. Vui lòng gia hạn trước khi mượn.');
    }

    const where = {
      reader_id: readerId,
      status: In([...this.activeLoanStatuses]),
    } as any;

    const activeLoans = await this.loanRepository.find({ where });
    const activeLoanCount = options?.excludeLoanId
      ? activeLoans.filter((loan) => loan.id !== options.excludeLoanId).length
      : activeLoans.length;

    if (activeLoanCount >= this.maxActiveLoansPerReader) {
      throw new BadRequestException(`Đã đạt giới hạn ${this.maxActiveLoansPerReader} sách đang xử lý/mượn.`);
    }
  }

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const loan = this.loanRepository.create({
      ...createLoanDto,
      status: createLoanDto.status || 'Pending',
    });
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
    await this.validateReaderEligibility(userId);

    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book does not exist');
    }

    if (Number(book.available || 0) <= 0) {
      throw new BadRequestException('Book is out of stock.');
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
        status: In([...this.activeLoanStatuses]),
      },
    });

    if (sameReaderSameBookLoan) {
      throw new BadRequestException(
        `You already have a ${sameReaderSameBookLoan.status} request/loan for this book. Please wait for processing or complete return first.`,
      );
    }

    const loan = this.loanRepository.create({
      reader_id: userId,
      book_id: bookId,
      issue_date: Date.now(),
      due_date: dueDate,
      status: 'Pending',
    });
    return this.loanRepository.save(loan);
  }

  async approvePendingLoan(loanId: number): Promise<Loan> {
    const loan = await this.findOne(loanId);
    if (loan.status !== 'Pending') {
      throw new BadRequestException(`Loan #${loanId} is not pending approval`);
    }

    const earliestPendingForBook = await this.loanRepository.findOne({
      where: {
        book_id: loan.book_id,
        status: 'Pending',
      },
      order: {
        issue_date: 'ASC',
        id: 'ASC',
      },
    });

    if (earliestPendingForBook && earliestPendingForBook.id !== loan.id) {
      throw new BadRequestException(
        `Please process pending requests in FIFO order. Earliest request is loan #${earliestPendingForBook.id}.`,
      );
    }

    await this.syncOverdueStatuses({ readerId: loan.reader_id });
    await this.validateReaderEligibility(loan.reader_id, { excludeLoanId: loan.id });

    const book = await this.bookRepository.findOne({ where: { id: loan.book_id } });
    if (!book) {
      throw new NotFoundException('Book does not exist');
    }

    if (Number(book.available || 0) <= 0) {
      throw new BadRequestException(
        'Book is not available right now. This request stays pending until stock is available.',
      );
    }

    const currentBorrowingLoan = await this.loanRepository.findOne({
      where: {
        book_id: loan.book_id,
        status: In(['Borrowing', 'Overdue']),
      },
    });

    if (currentBorrowingLoan) {
      throw new BadRequestException(
        'Sách đã được người khác mượn trong lúc chờ duyệt. Vui lòng thử lại hoặc hủy yêu cầu.',
      );
    }

    loan.status = 'Borrowing';
    loan.issue_date = Date.now();
    return this.loanRepository.save(loan);
  }

  async rejectPendingLoan(loanId: number): Promise<{ success: boolean; message: string; loan: Loan }> {
    const loan = await this.findOne(loanId);
    if (loan.status !== 'Pending') {
      throw new BadRequestException(`Loan #${loanId} is not pending approval`);
    }

    loan.status = 'Cancelled';
    const savedLoan = await this.loanRepository.save(loan);

    return {
      success: true,
      message: 'Loan request cancelled',
      loan: savedLoan,
    };
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
    const loans = await this.loanRepository.find({
      where: { reader_id: userId, status: In(['Pending', 'Borrowing', 'Overdue']) },
      order: { due_date: 'ASC' },
      relations: ['book'],
    });

    const pendingBookIds = Array.from(
      new Set(
        loans
          .filter((loan) => loan.status === 'Pending')
          .map((loan) => loan.book_id),
      ),
    );

    if (pendingBookIds.length === 0) {
      return loans;
    }

    const pendingLoansByBook = await this.loanRepository.find({
      where: {
        book_id: In(pendingBookIds),
        status: 'Pending',
      },
      order: {
        book_id: 'ASC',
        issue_date: 'ASC',
        id: 'ASC',
      },
    });

    const queuePositionByLoanId = new Map<number, number>();
    const currentPositionByBook = new Map<number, number>();

    for (const pendingLoan of pendingLoansByBook) {
      const currentPosition = (currentPositionByBook.get(pendingLoan.book_id) || 0) + 1;
      currentPositionByBook.set(pendingLoan.book_id, currentPosition);
      queuePositionByLoanId.set(pendingLoan.id, currentPosition);
    }

    return loans.map((loan) => {
      if (loan.status === 'Pending') {
        (loan as any).queue_position = queuePositionByLoanId.get(loan.id) || 1;
      }
      return loan;
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
