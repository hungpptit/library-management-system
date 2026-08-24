import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';

describe('LoansController', () => {
  let controller: LoansController;
  let service: LoansService;

  const mockLoansService = {
    create: jest.fn(),
    findAll: jest.fn(),
    getActiveLoans: jest.fn(),
    searchLoan: jest.fn(),
    confirmReturnClean: jest.fn(),
    approvePendingLoan: jest.fn(),
    rejectPendingLoan: jest.fn(),
    reportDamageOrLoss: jest.fn(),
    getReaderFines: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    borrow: jest.fn(),
    returnLoan: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        {
          provide: LoansService,
          useValue: mockLoansService,
        },
      ],
    }).compile();

    controller = module.get<LoansController>(LoansController);
    service = module.get<LoansService>(LoansService);
  });

  it('should call service.borrow', async () => {
    const borrowDto = { userId: 1, bookId: 2, dueDate: 1750000000000 };
    mockLoansService.borrow.mockResolvedValue({ id: 10, ...borrowDto });

    const result = await controller.borrow(borrowDto);
    expect(service.borrow).toHaveBeenCalledWith(1, 2, 1750000000000);
    expect(result).toHaveProperty('id', 10);
  });

  it('should call service.approvePendingLoan', async () => {
    mockLoansService.approvePendingLoan.mockResolvedValue({ id: 10, status: 'Borrowing' });
    const result = await controller.approvePendingLoan(10);
    expect(service.approvePendingLoan).toHaveBeenCalledWith(10);
    expect(result.status).toBe('Borrowing');
  });

  it('should call service.rejectPendingLoan', async () => {
    mockLoansService.rejectPendingLoan.mockResolvedValue({ success: true });
    const result = await controller.rejectPendingLoan(10);
    expect(service.rejectPendingLoan).toHaveBeenCalledWith(10);
    expect(result.success).toBe(true);
  });

  it('should call service.confirmReturnClean', async () => {
    mockLoansService.confirmReturnClean.mockResolvedValue({ success: true });
    const result = await controller.confirmReturnClean(10);
    expect(service.confirmReturnClean).toHaveBeenCalledWith(10);
    expect(result.success).toBe(true);
  });

  it('should call service.reportDamageOrLoss', async () => {
    const dto = { condition: 'Damaged' as const, overdueDays: 2, adminNote: 'Pages ripped' };
    mockLoansService.reportDamageOrLoss.mockResolvedValue({ totalFine: 20 });
    const result = await controller.reportDamageOrLoss(10, dto);
    expect(service.reportDamageOrLoss).toHaveBeenCalledWith({ loanId: 10, ...dto });
    expect(result.totalFine).toBe(20);
  });

  it('should call service.returnLoan', async () => {
    mockLoansService.returnLoan.mockResolvedValue({ id: 10, status: 'Returned' });
    const result = await controller.returnLoan(10);
    expect(service.returnLoan).toHaveBeenCalledWith(10);
    expect(result.status).toBe('Returned');
  });

  it('should call service.getActiveLoans', async () => {
    mockLoansService.getActiveLoans.mockResolvedValue([]);
    await controller.getActiveLoans(1);
    expect(service.getActiveLoans).toHaveBeenCalledWith(1);
  });

  it('should call service.getReaderFines', async () => {
    mockLoansService.getReaderFines.mockResolvedValue({ totalFines: 0, fineDetails: [] });
    await controller.getReaderFines(1);
    expect(service.getReaderFines).toHaveBeenCalledWith(1);
  });
});
