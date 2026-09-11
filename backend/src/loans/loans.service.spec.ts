import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoansService } from './loans.service';
import { Loan } from './loan.entity';
import { FineLog } from './finelog.entity';
import { Book } from '../books/book.entity';
import { User } from '../users/user.entity';

describe('LoansService', () => {
  let service: LoansService;
  let loanRepository: any;
  let fineLogRepository: any;
  let bookRepository: any;
  let userRepository: any;

  const mockReader: User = {
    id: 1,
    email: 'student@university.edu',
    display_name: 'Student One',
    student_id: 'STU001',
    password: 'hashedpassword',
    role: 'reader',
    status: 'active',
    card_expiry: Date.now() + 100000000,
    created_at: Date.now(),
    loans: [],
  };

  const mockBook: Partial<Book> = {
    id: 1,
    title: 'The Great Gatsby',
    isbn: '9780743273565',
    quantity: 5,
    available: 3,
    price: 20.0,
    created_at: Date.now(),
    deleted_at: null as any,
    authors: [],
  };

  const mockLoan: Loan = {
    id: 10,
    book_id: 1,
    reader_id: 1,
    issue_date: Date.now() - 5000,
    due_date: Date.now() + 86400000,
    return_date: null as any,
    return_condition: null as any,
    status: 'Pending',
    book: mockBook as Book,
    user: mockReader,
    fineLogs: [],
  };

  beforeEach(async () => {
    loanRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ id: 10, ...dto })),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      })),
    };

    fineLogRepository = {
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => (Array.isArray(dto) ? dto.map((d, i) => ({ id: i + 1, ...d })) : { id: 1, ...dto })),
    };

    bookRepository = {
      findOne: jest.fn(),
      save: jest.fn(async (b) => b),
    };

    userRepository = {
      findOne: jest.fn(),
    };

    const mockEntityManager = {
      save: jest.fn(async (_entity: any, dto: any) => (Array.isArray(dto) ? dto.map((d, i) => ({ id: i + 1, ...d })) : dto)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      findOne: jest.fn((entity: any, options: any) => {
        if (entity === Book) return bookRepository.findOne(options);
        return loanRepository.findOne(options);
      }),
      create: jest.fn((_entity: any, dto: any) => dto),
    };

    const mockDataSource = {
      transaction: jest.fn(async (cb: any) => cb(mockEntityManager)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: getRepositoryToken(Loan), useValue: loanRepository },
        { provide: getRepositoryToken(FineLog), useValue: fineLogRepository },
        { provide: getRepositoryToken(Book), useValue: bookRepository },
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  describe('create and CRUD', () => {
    it('should create a loan directly', async () => {
      const dto = { book_id: 1, reader_id: 1, issue_date: 1000, due_date: 2000, status: 'Pending' as const };
      const result = await service.create(dto);
      expect(result).toHaveProperty('status', 'Pending');
    });

    it('should find all loans', async () => {
      loanRepository.find.mockResolvedValue([mockLoan]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should find one loan by id', async () => {
      loanRepository.findOne.mockResolvedValue(mockLoan);
      const result = await service.findOne(10);
      expect(result.id).toBe(10);
    });

    it('should throw NotFoundException if loan not found in findOne', async () => {
      loanRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should update loan', async () => {
      loanRepository.findOne.mockResolvedValue({ ...mockLoan, status: 'Returned' });
      const result = await service.update(10, { status: 'Returned' });
      expect(result.status).toBe('Returned');
    });

    it('should remove loan successfully', async () => {
      loanRepository.delete.mockResolvedValue({ affected: 1 });
      const result = await service.remove(10);
      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if loan to remove does not exist', async () => {
      loanRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchLoan', () => {
    it('should throw NotFoundException if searchLoan does not find loan', async () => {
      loanRepository.findOne.mockResolvedValue(null);
      await expect(service.searchLoan(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if loan is not Borrowing or Overdue', async () => {
      loanRepository.findOne.mockResolvedValue({ ...mockLoan, status: 'Pending' });
      await expect(service.searchLoan(10)).rejects.toThrow('is not in Borrowing or Overdue status');
    });
  });
  describe('borrow', () => {
    it('should successfully create a pending loan when all conditions are met', async () => {
      userRepository.findOne.mockResolvedValue(mockReader);
      loanRepository.find.mockResolvedValue([]); // Active loans count = 0
      bookRepository.findOne.mockResolvedValue(mockBook); // Book found & available = 3
      loanRepository.findOne
        .mockResolvedValueOnce(null) // No overdue loans
        .mockResolvedValueOnce(null); // No existing loan for same book

      const dueDate = Date.now() + 14 * 24 * 60 * 60 * 1000;
      const result = await service.borrow(1, 1, dueDate);

      expect(result).toHaveProperty('status', 'Pending');
      expect(result.book_id).toBe(1);
      expect(result.reader_id).toBe(1);
    });

    it('should throw BadRequestException if reader has reached the 5 active loan limit', async () => {
      userRepository.findOne.mockResolvedValue(mockReader);
      loanRepository.find.mockResolvedValue([
        { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
      ]); // 5 active loans

      await expect(service.borrow(1, 1, Date.now() + 100000)).rejects.toThrow(
        'Đã đạt giới hạn 5 sách đang xử lý/mượn.',
      );
    });

    it('should throw BadRequestException if reader library card is expired', async () => {
      const expiredReader = { ...mockReader, card_expiry: Date.now() - 10000 };
      userRepository.findOne.mockResolvedValue(expiredReader);

      await expect(service.borrow(1, 1, Date.now() + 100000)).rejects.toThrow(
        'Thẻ thư viện đã hết hạn. Vui lòng gia hạn trước khi mượn.',
      );
    });

    it('should throw BadRequestException if reader status is not active', async () => {
      const inactiveReader = { ...mockReader, status: 'deleted' };
      userRepository.findOne.mockResolvedValue(inactiveReader);

      await expect(service.borrow(1, 1, Date.now() + 100000)).rejects.toThrow(
        'Tài khoản reader đang bị khóa hoặc không hoạt động.',
      );
    });

    it('should throw BadRequestException if book is out of stock', async () => {
      userRepository.findOne.mockResolvedValue(mockReader);
      loanRepository.find.mockResolvedValue([]);
      bookRepository.findOne.mockResolvedValue({ ...mockBook, available: 0 });

      await expect(service.borrow(1, 1, Date.now() + 100000)).rejects.toThrow(
        'Book is out of stock.',
      );
    });

    it('should throw BadRequestException if reader has overdue loans', async () => {
      userRepository.findOne.mockResolvedValue(mockReader);
      loanRepository.find.mockResolvedValue([]);
      bookRepository.findOne.mockResolvedValue(mockBook);
      loanRepository.findOne.mockResolvedValueOnce({ id: 99, status: 'Overdue' }); // Overdue loan found

      await expect(service.borrow(1, 1, Date.now() + 100000)).rejects.toThrow(
        'You still have overdue loan(s). Please return overdue books before borrowing new ones.',
      );
    });

    it('should throw BadRequestException if reader already has active loan for the same book', async () => {
      userRepository.findOne.mockResolvedValue(mockReader);
      loanRepository.find.mockResolvedValue([]);
      bookRepository.findOne.mockResolvedValue(mockBook);
      loanRepository.findOne
        .mockResolvedValueOnce(null) // No overdue
        .mockResolvedValueOnce({ id: 88, status: 'Borrowing' }); // Duplicate loan

      await expect(service.borrow(1, 1, Date.now() + 100000)).rejects.toThrow(
        'You already have a Borrowing request/loan for this book',
      );
    });
  });

  describe('approvePendingLoan', () => {
    it('should approve pending loan in FIFO order and change status to Borrowing', async () => {
      const pendingLoan = { ...mockLoan, id: 10, status: 'Pending' as const };
      loanRepository.findOne
        .mockResolvedValueOnce(pendingLoan) // findOne(loanId)
        .mockResolvedValueOnce(pendingLoan); // earliestPending check (matches loan)

      userRepository.findOne.mockResolvedValue(mockReader);
      loanRepository.find.mockResolvedValue([pendingLoan]);
      bookRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.approvePendingLoan(10);

      expect(result.status).toBe('Borrowing');
      expect(loanRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if FIFO order is violated (not earliest request)', async () => {
      const loanToApprove = { ...mockLoan, id: 15, status: 'Pending' as const };
      const earlierLoan = { ...mockLoan, id: 10, status: 'Pending' as const };

      loanRepository.findOne
        .mockResolvedValueOnce(loanToApprove) // findOne(loanId)
        .mockResolvedValueOnce(earlierLoan); // earliest pending has id 10

      await expect(service.approvePendingLoan(15)).rejects.toThrow(
        'Cuốn sách này đang có bạn đọc đăng ký trước (Phiếu #10)',
      );
    });

    it('should throw BadRequestException if loan is not in Pending status', async () => {
      loanRepository.findOne.mockResolvedValueOnce({ ...mockLoan, status: 'Borrowing' });

      await expect(service.approvePendingLoan(10)).rejects.toThrow(
        'Loan #10 is not pending approval',
      );
    });
  });

  describe('rejectPendingLoan', () => {
    it('should cancel a pending loan successfully', async () => {
      const pendingLoan = { ...mockLoan, status: 'Pending' as const };
      loanRepository.findOne.mockResolvedValueOnce(pendingLoan);

      const result = await service.rejectPendingLoan(10);

      expect(result.success).toBe(true);
      expect(result.loan.status).toBe('Cancelled');
    });

    it('should throw BadRequestException if rejecting a non-pending loan', async () => {
      loanRepository.findOne.mockResolvedValueOnce({ ...mockLoan, status: 'Returned' });

      await expect(service.rejectPendingLoan(10)).rejects.toThrow(
        'Loan #10 is not pending approval',
      );
    });
  });

  describe('returnLoan and confirmReturnClean', () => {
    it('should complete loan return with status Returned and condition Clean', async () => {
      loanRepository.findOne.mockResolvedValue({ ...mockLoan, status: 'Borrowing' });

      const result = await service.returnLoan(10);

      expect(result.status).toBe('Returned');
      expect(result.return_condition).toBe('Clean');
      expect(result.return_date).toBeDefined();
    });

    it('should confirm return clean via confirmReturnClean', async () => {
      loanRepository.findOne
        .mockResolvedValueOnce({ ...mockLoan, status: 'Borrowing' }) // searchLoan
        .mockResolvedValueOnce({ ...mockLoan, status: 'Returned', return_condition: 'Clean' }); // findOne after update

      const result = await service.confirmReturnClean(10);

      expect(result.success).toBe(true);
      expect(result.loan.status).toBe('Returned');
    });
  });

  describe('reportDamageOrLoss', () => {
    it('should record 50% book price fine for Damaged condition', async () => {
      const borrowingLoan = { ...mockLoan, status: 'Borrowing' as const, book: { ...mockBook, price: 100 } };
      loanRepository.findOne
        .mockResolvedValueOnce(borrowingLoan) // searchLoan
        .mockResolvedValueOnce({ ...borrowingLoan, status: 'Damaged', return_condition: 'Damaged' }); // findOne

      const result = await service.reportDamageOrLoss({
        loanId: 10,
        condition: 'Damaged',
        overdueDays: 0,
        adminNote: 'Torn pages',
      });

      expect(result.totalFine).toBe(50); // 50% of 100
      expect(result.fineLogs).toHaveLength(2); // 1 damage fine + 1 admin note
      expect(result.loan.status).toBe('Damaged');
    });

    it('should record 150% book price fine + overdue penalty for Lost condition', async () => {
      const overdueLoan = { ...mockLoan, status: 'Overdue' as const, book: { ...mockBook, price: 100 } };
      loanRepository.findOne
        .mockResolvedValueOnce(overdueLoan) // searchLoan
        .mockResolvedValueOnce({ ...overdueLoan, status: 'Lost', return_condition: 'Lost' }); // findOne

      const result = await service.reportDamageOrLoss({
        loanId: 10,
        condition: 'Lost',
        overdueDays: 4, // 4 * (100 * 0.05) = 20
        adminNote: 'Lost on bus',
      });

      // Total fine: 150 (lost) + 20 (overdue) = 170
      expect(result.totalFine).toBe(170);
    });

    it('should throw BadRequestException if condition is invalid', async () => {
      await expect(
        service.reportDamageOrLoss({
          loanId: 10,
          condition: 'InvalidCondition' as any,
        }),
      ).rejects.toThrow('Condition must be Damaged or Lost');
    });
  });

  describe('getActiveLoans', () => {
    it('should calculate queue position for pending loans', async () => {
      const pending1 = { ...mockLoan, id: 101, book_id: 1, status: 'Pending' };
      const pending2 = { ...mockLoan, id: 102, book_id: 1, status: 'Pending' };

      loanRepository.find
        .mockResolvedValueOnce([pending2]) // reader loans
        .mockResolvedValueOnce([pending1, pending2]); // all pending loans for book 1

      const result = await service.getActiveLoans(1);

      expect(result).toHaveLength(1);
      expect((result[0] as any).queue_position).toBe(2);
    });
  });

  describe('getReaderFines', () => {
    it('should calculate total fines correctly', async () => {
      const loanWithFines = {
        ...mockLoan,
        fineLogs: [
          { id: 1, fine_amount: 25.0, reason: 'Damaged' },
          { id: 2, fine_amount: 10.0, reason: 'Overdue 2 days' },
        ],
      };
      loanRepository.find.mockResolvedValue([loanWithFines]);

      const result = await service.getReaderFines(1);

      expect(result.totalFines).toBe(35.0);
      expect(result.fineDetails).toHaveLength(2);
    });
  });
});
