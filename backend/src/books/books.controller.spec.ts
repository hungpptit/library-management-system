import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { JwtService } from '@nestjs/jwt';

describe('BooksController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBooksService = {
    create: jest.fn(),
    findByIsbn: jest.fn(),
    findAll: jest.fn(),
    search: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  it('should call service.create and handle CONFLICT_ISBN by throwing ConflictException', async () => {
    mockBooksService.create.mockRejectedValueOnce(new Error('CONFLICT_ISBN'));

    await expect(controller.create({ title: 'Clean Code', isbn: '123' })).rejects.toThrow(ConflictException);
  });

  it('should call service.findByIsbn and throw NotFoundException if not found', async () => {
    mockBooksService.findByIsbn.mockResolvedValueOnce(null);

    await expect(controller.findByIsbn('999')).rejects.toThrow(NotFoundException);
  });

  it('should call service.findAll', async () => {
    mockBooksService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('should call service.search with keyword', async () => {
    mockBooksService.search.mockResolvedValue([{ id: 1, title: 'Gatsby' }]);
    const result = await controller.search('Gatsby');
    expect(service.search).toHaveBeenCalledWith('Gatsby');
    expect(result).toHaveLength(1);
  });

  it('should call service.findOne', async () => {
    mockBooksService.findOne.mockResolvedValue({ id: 1 });
    const result = await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1 });
  });

  it('should call service.update', async () => {
    mockBooksService.update.mockResolvedValue({ id: 1, title: 'Updated' });
    const result = await controller.update(1, { title: 'Updated' });
    expect(service.update).toHaveBeenCalledWith(1, { title: 'Updated' });
    expect(result.title).toBe('Updated');
  });

  it('should call service.remove', async () => {
    mockBooksService.remove.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
