import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Book } from './book.entity';
import { Author } from './author.entity';
import { Publisher } from './publisher.entity';
import { Category } from './category.entity';
import { Loan } from '../loans/loan.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Author)
    private readonly authorRepository: Repository<Author>,
    @InjectRepository(Publisher)
    private readonly publisherRepository: Repository<Publisher>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  private async appendPendingCounts<T extends { id: number }>(books: T[]): Promise<Array<T & { pending_count: number }>> {
    if (books.length === 0) {
      return [];
    }

    const pendingCounts = await this.loanRepository
      .createQueryBuilder('loan')
      .select('loan.book_id', 'book_id')
      .addSelect('COUNT(*)', 'pending_count')
      .where('loan.status = :status', { status: 'Pending' })
      .groupBy('loan.book_id')
      .getRawMany<{ book_id: string; pending_count: string }>();

    const pendingCountMap = new Map<number, number>(
      pendingCounts.map((item) => [Number(item.book_id), Number(item.pending_count)]),
    );

    return books.map((book) => ({
      ...book,
      pending_count: pendingCountMap.get(Number(book.id)) || 0,
    }));
  }

  async create(bookData: any): Promise<Book> {
    const { author, publisher, genre, category, coverUrl, ...rest } = bookData;
    
    // Check ISBN conflict
    if (rest.isbn) {
      const existingBook = await this.bookRepository.findOne({ where: { isbn: rest.isbn } });
      if (existingBook) {
        throw new Error('CONFLICT_ISBN');
      }
    }

    // "Find or Create" logic for Author
    let authorEntity: Author;
    if (author) {
      const authorName = typeof author === 'string' ? author : author.name;
      authorEntity = await this.authorRepository.findOne({ where: { name: authorName } });
      
      if (!authorEntity) {
        authorEntity = this.authorRepository.create({ 
          name: authorName,
          created_at: Date.now() 
        });
        authorEntity = await this.authorRepository.save(authorEntity);
      }
    }

    // "Find or Create" logic for Publisher
    let publisherEntity: Publisher;
    if (publisher) {
      const publisherName = typeof publisher === 'string' ? publisher : publisher.name;
      publisherEntity = await this.publisherRepository.findOne({ where: { name: publisherName } });

      if (!publisherEntity) {
        publisherEntity = this.publisherRepository.create({
          name: publisherName,
          created_at: Date.now()
        });
        publisherEntity = await this.publisherRepository.save(publisherEntity);
      }
    }

    // "Find or Create" logic for Category (Genre)
    let categoryEntity: Category;
    const categoryName = category || genre; // Support both naming conventions
    if (categoryName) {
      const name = typeof categoryName === 'string' ? categoryName : categoryName.name;
      categoryEntity = await this.categoryRepository.findOne({ where: { name } });

      if (!categoryEntity) {
        categoryEntity = this.categoryRepository.create({
          name,
          created_at: Date.now()
        });
        categoryEntity = await this.categoryRepository.save(categoryEntity);
      }
    }

    const newBook = this.bookRepository.create({
      ...rest,
      cover_url: coverUrl || rest.cover_url, // Map camelCase from frontend to snake_case in DB
      authors: authorEntity ? [authorEntity] : [], // Assign found/created author
      publisher: publisherEntity, // Assign found/created publisher
      category: categoryEntity, // Assign found/created category
      created_at: Date.now(),
      available: rest.quantity || 0,
      deleted_at: null, // Ensure deleted_at is null for new books
    });

    const savedBook = await this.bookRepository.save(newBook);
    const id = (savedBook as any).id;
    return this.findOne(id);
  }

  async findByIsbn(isbn: string): Promise<Book | null> {
    return await this.bookRepository.findOne({
      where: { isbn },
      relations: ['category', 'authors', 'publisher'],
    });
  }

  async findAll(): Promise<Book[]> {
    const books = await this.bookRepository.find({
      relations: ['category', 'authors', 'publisher'],
      take: 50,
    });

    return this.appendPendingCounts(books);
  }

  async search(keyword: string): Promise<Book[]> {
    if (!keyword) {
      return this.findAll();
    }

    const books = await this.bookRepository.find({
      where: [
        { title: ILike(`%${keyword}%`) },
        { isbn: ILike(`%${keyword}%`) },
        { description: ILike(`%${keyword}%`) },
      ],
      relations: ['category', 'authors', 'publisher'],
      take: 50,
    });

    return this.appendPendingCounts(books);
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id },
      relations: ['category', 'authors', 'publisher'],
    });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    const [enrichedBook] = await this.appendPendingCounts([book]);
    return enrichedBook;
  }

  async update(id: number, bookData: any): Promise<Book> {
    const { author, publisher, genre, category, coverUrl, ...rest } = bookData;

    // 1. Kiểm tra tồn tại
    const existingBook = await this.bookRepository.findOne({ where: { id } });
    if (!existingBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // 2. Check ISBN conflict (Trừ ISBN hiện tại của chính nó)
    if (rest.isbn && rest.isbn !== existingBook.isbn) {
      const isbnConflict = await this.bookRepository.findOne({ where: { isbn: rest.isbn } });
      if (isbnConflict) {
        throw new Error('CONFLICT_ISBN');
      }
    }

    // 3. Find or Create Author
    let authorEntity: Author;
    if (author) {
      const authorName = typeof author === 'string' ? author : author.name;
      authorEntity = await this.authorRepository.findOne({ where: { name: authorName } });
      if (!authorEntity) {
        authorEntity = this.authorRepository.create({ name: authorName, created_at: Date.now() });
        authorEntity = await this.authorRepository.save(authorEntity);
      }
    }

    // 4. Find or Create Publisher
    let publisherEntity: Publisher;
    if (publisher) {
      const publisherName = typeof publisher === 'string' ? publisher : publisher.name;
      publisherEntity = await this.publisherRepository.findOne({ where: { name: publisherName } });
      if (!publisherEntity) {
        publisherEntity = this.publisherRepository.create({ name: publisherName, created_at: Date.now() });
        publisherEntity = await this.publisherRepository.save(publisherEntity);
      }
    }

    // 5. Find or Create Category
    let categoryEntity: Category;
    const categoryName = category || genre;
    if (categoryName) {
      const name = typeof categoryName === 'string' ? categoryName : categoryName.name;
      categoryEntity = await this.categoryRepository.findOne({ where: { name } });
      if (!categoryEntity) {
        categoryEntity = this.categoryRepository.create({ name, created_at: Date.now() });
        categoryEntity = await this.categoryRepository.save(categoryEntity);
      }
    }

    // 6. Update Book
    const updateData: any = {
      ...rest,
      cover_url: coverUrl || rest.cover_url,
      publisher: publisherEntity || undefined,
      category: categoryEntity || undefined,
    };

    if (authorEntity) {
      updateData.authors = [authorEntity];
    }

    await this.bookRepository.save({
      id,
      ...updateData
    });

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    const activeStatuses = ['Pending', 'Borrowing', 'Overdue'];
    const activeLoanCount = await this.loanRepository.count({
      where: activeStatuses.map(status => ({ book_id: id, status })),
    });

    if (activeLoanCount > 0) {
      throw new BadRequestException(
        'Cannot delete this book because it is currently being borrowed. Please wait until all copies are returned.',
      );
    }

    await this.bookRepository.softDelete(id);
  }
}
