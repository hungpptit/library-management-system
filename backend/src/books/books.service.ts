import { Injectable } from '@nestjs/common';

@Injectable()
export class BooksService {
  private books = []; // Temporary mock data

  create(book: any) {
    this.books.push(book);
    return 'Book created successfully';
  }

  findAll() {
    return this.books;
  }

  findOne(id: string) {
    return `This action returns a #${id} book`;
  }

  update(id: string, book: any) {
    return `This action updates a #${id} book`;
  }

  remove(id: string) {
    return `This action removes a #${id} book`;
  }
}
