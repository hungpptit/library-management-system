import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  findAll(@Query('readerId') readerId?: string) {
    const userId = readerId ? Number(readerId) : undefined;
    return this.loansService.findAll(userId);
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
  borrow(@Body() borrowData: { userId: number; bookId: number; dueDate: number }) {
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