import { Controller, Get, Post, Body, Param, Put, Delete, Query, ParseIntPipe, ConflictException, NotFoundException, UseGuards } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() bookData: Partial<Book>) {
    try {
      return await this.booksService.create(bookData);
    } catch (error) {
      if (error.message === 'CONFLICT_ISBN') {
        throw new ConflictException('ISBN already exists in system');
      }
      throw error;
    }
  }

  @Get('isbn/:isbn')
  async findByIsbn(@Param('isbn') isbn: string) {
    const book = await this.booksService.findByIsbn(isbn);
    if (!book) {
      throw new NotFoundException('Book not found with this ISBN');
    }
    return book;
  }

  @Get()
  async findAll() {
    return this.booksService.findAll();
  }

  @Get('search')
  async search(@Query('keyword') keyword: string) {
    return this.booksService.search(keyword);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Param('id', ParseIntPipe) id: number, @Body() bookData: Partial<Book>) {
    return this.booksService.update(id, bookData);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}

