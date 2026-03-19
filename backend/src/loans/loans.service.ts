import { Injectable } from '@nestjs/common';

@Injectable()
export class LoansService {
  private loans = []; // Temporary mock data

  create(loan: any) {
    this.loans.push(loan);
    return 'Loan created successfully';
  }

  findAll() {
    return this.loans;
  }

  findOne(id: string) {
    return `This action returns a #${id} loan`;
  }

  update(id: string, loan: any) {
    return `This action updates a #${id} loan`;
  }

  remove(id: string) {
    return `This action removes a #${id} loan`;
  }
}
