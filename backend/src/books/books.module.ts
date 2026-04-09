import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { Category } from './category.entity';
import { Publisher } from './publisher.entity';
import { Author } from './author.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Book, Category, Publisher, Author])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
