import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Loan } from './loan.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  async create(createLoanDto: CreateLoanDto): Promise<Loan> {
    const loan = this.loanRepository.create(createLoanDto);
    return this.loanRepository.save(loan);
  }

  async findAll(readerId?: number): Promise<Loan[]> {
    const where = readerId ? { reader_id: readerId } : undefined;
    return this.loanRepository.find({
      where,
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
    return this.loanRepository.save(loan);
  }
}
