import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { Loan } from './loan.entity';
import { FineLog } from './finelog.entity';
import { Book } from '../books/book.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Loan, FineLog, Book, User])],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
