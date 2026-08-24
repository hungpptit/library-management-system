import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './book.entity';
import { Author } from './author.entity';
import { Publisher } from './publisher.entity';
import { Category } from './category.entity';
import { Loan } from '../loans/loan.entity';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepository: any;
  let authorRepository: any;
  let publisherRepository: any;
  let categoryRepository: any;
  let loanRepository: any;

  const mockBook: Partial<Book> = {
    id: 1,
    title: 'The Great Gatsby',
    isbn: '9780743273565',
    category_id: 1,
    publisher_id: 1,
    category: { id: 1, name: 'Classic', location_area: 'A1', created_at: 1710000000, books: [] },
    publisher: { id: 1, name: 'Scribner', address: 'USA', phone: '123', created_at: 1710000000, books: [] },
    authors: [{ id: 1, name: 'F. Scott Fitzgerald', bio: 'USA', created_at: 1710000000, books: [] }],
    quantity: 5,
    available: 5,
    price: 15.99,
    description: 'A classic American novel about wealth and love.',
    cover_url: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
    year: 1925,
    location: 'Shelf A-12',
    created_at: 1710000000,
    deleted_at: null as any,
  };

  beforeEach(async () => {
    bookRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
    };

    authorRepository = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ id: 10, ...dto })),
    };

    publisherRepository = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ id: 20, ...dto })),
    };

    categoryRepository = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn(async (dto) => ({ id: 30, ...dto })),
    };

    loanRepository = {
      count: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getRepositoryToken(Book), useValue: bookRepository },
        { provide: getRepositoryToken(Author), useValue: authorRepository },
        { provide: getRepositoryToken(Publisher), useValue: publisherRepository },
        { provide: getRepositoryToken(Category), useValue: categoryRepository },
        { provide: getRepositoryToken(Loan), useValue: loanRepository },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  describe('create', () => {
    it('should create a book with find-or-create relations', async () => {
      const bookData = {
        title: 'Head First Design Patterns',
        isbn: '978-0596007126',
        author: 'Eric Freeman',
        genre: 'Programming',
        publisher: "O'Reilly Media",
        quantity: 3,
        price: 45.99,
        year: 2004,
        location: 'Shelf P-01',
      };

      bookRepository.findOne
        .mockResolvedValueOnce(null) // Check ISBN conflict
        .mockResolvedValueOnce({ ...mockBook, id: 2, title: bookData.title }); // findOne inside create

      authorRepository.findOne.mockResolvedValue(null);
      publisherRepository.findOne.mockResolvedValue(null);
      categoryRepository.findOne.mockResolvedValue(null);

      bookRepository.create.mockImplementation((dto: any) => ({ ...dto, id: 2 }));
      bookRepository.save.mockImplementation(async (b: any) => b);

      const result = await service.create(bookData);

      expect(authorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Eric Freeman' }),
      );
      expect(publisherRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "O'Reilly Media" }),
      );
      expect(categoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Programming' }),
      );
      expect(result.title).toBe('Head First Design Patterns');
    });

    it('should throw CONFLICT_ISBN error if ISBN already exists', async () => {
      bookRepository.findOne.mockResolvedValueOnce(mockBook);

      await expect(
        service.create({ title: 'Duplicate Book', isbn: '9780743273565' }),
      ).rejects.toThrow('CONFLICT_ISBN');
    });
  });

  describe('findByIsbn', () => {
    it('should return book if ISBN exists', async () => {
      bookRepository.findOne.mockResolvedValue(mockBook);
      const result = await service.findByIsbn('9780743273565');
      expect(result).toEqual(mockBook);
    });

    it('should return null if ISBN does not exist', async () => {
      bookRepository.findOne.mockResolvedValue(null);
      const result = await service.findByIsbn('0000000000');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return empty array if no books exist', async () => {
      bookRepository.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('should return books enriched with pending loan counts', async () => {
      bookRepository.find.mockResolvedValue([mockBook]);
      loanRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ book_id: '1', pending_count: '2' }]),
      });

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('pending_count', 2);
    });
  });

  describe('search', () => {
    it('should search books matching keyword and return enriched results', async () => {
      bookRepository.find.mockResolvedValue([mockBook]);

      const result = await service.search('Gatsby');

      expect(bookRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['category', 'authors', 'publisher'],
          take: 50,
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('The Great Gatsby');
    });

    it('should return all books if keyword is empty', async () => {
      bookRepository.find.mockResolvedValue([mockBook]);

      const result = await service.search('');

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return book if found', async () => {
      bookRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.findOne(1);
      expect(result.id).toBe(1);
      expect(result.title).toBe('The Great Gatsby');
    });

    it('should throw NotFoundException if book not found', async () => {
      bookRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update book fields successfully', async () => {
      bookRepository.findOne
        .mockResolvedValueOnce({ ...mockBook }) // find existing
        .mockResolvedValueOnce({ ...mockBook, title: 'Clean Architecture (Updated Edition)' }); // findOne return

      bookRepository.save.mockResolvedValue({ id: 1 });

      const result = await service.update(1, {
        title: 'Clean Architecture (Updated Edition)',
        price: 39.99,
      });

      expect(bookRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Clean Architecture (Updated Edition)',
          price: 39.99,
        }),
      );
      expect(result.title).toBe('Clean Architecture (Updated Edition)');
    });

    it('should throw CONFLICT_ISBN if updated ISBN belongs to another book', async () => {
      bookRepository.findOne
        .mockResolvedValueOnce({ ...mockBook, id: 1, isbn: '1111111111' }) // existing target
        .mockResolvedValueOnce({ ...mockBook, id: 2, isbn: '2222222222' }); // conflict match

      await expect(
        service.update(1, { isbn: '2222222222' }),
      ).rejects.toThrow('CONFLICT_ISBN');
    });

    it('should throw NotFoundException if book to update does not exist', async () => {
      bookRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Nonexistent' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete book when no active loans exist', async () => {
      bookRepository.findOne.mockResolvedValue(mockBook);
      loanRepository.count.mockResolvedValue(0);
      bookRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(loanRepository.count).toHaveBeenCalled();
      expect(bookRepository.softDelete).toHaveBeenCalledWith(1);
    });

    it('should throw BadRequestException if book has active loans', async () => {
      bookRepository.findOne.mockResolvedValue(mockBook);
      loanRepository.count.mockResolvedValue(2); // 2 active loans

      await expect(service.remove(1)).rejects.toThrow(
        'Cannot delete this book because it is currently being borrowed. Please wait until all copies are returned.',
      );
      expect(bookRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if book to delete does not exist', async () => {
      bookRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
