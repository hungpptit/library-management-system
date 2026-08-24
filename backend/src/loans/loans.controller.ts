import { Controller, Get, Post, Body, Param, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { BorrowLoanDto } from './dto/borrow-loan.dto';
import { ReportDamageDto } from './dto/report-damage.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  findAll() {
    return this.loansService.findAll();
  }

  @Get('my-active-loans/:userId')
  getActiveLoans(@Param('userId', ParseIntPipe) userId: number) {
    return this.loansService.getActiveLoans(userId);
  }

  @Get('search/:loanId')
  searchLoan(@Param('loanId', ParseIntPipe) loanId: number) {
    return this.loansService.searchLoan(loanId);
  }

  @Post(':id/confirm-clean')
  confirmReturnClean(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.confirmReturnClean(id);
  }

  @Post(':id/approve')
  approvePendingLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.approvePendingLoan(id);
  }

  @Post(':id/reject')
  rejectPendingLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.rejectPendingLoan(id);
  }

  @Post(':id/report-damage')
  reportDamageOrLoss(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnData: ReportDamageDto,
  ) {
    return this.loansService.reportDamageOrLoss({
      ...returnData,
      loanId: id,
    });
  }

  @Get('fines/:userId')
  getReaderFines(@Param('userId', ParseIntPipe) userId: number) {
    return this.loansService.getReaderFines(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.remove(id);
  }

  @Post('borrow')
  borrow(@Body() borrowData: BorrowLoanDto) {
    return this.loansService.borrow(
      borrowData.userId,
      borrowData.bookId,
      borrowData.dueDate,
    );
  }

  @Put(':id/return')
  returnLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.returnLoan(id);
  }
}