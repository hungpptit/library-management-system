import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let jwtService: any;

  const mockUser: User = {
    id: 1,
    email: 'reader@library.com',
    display_name: 'Nguyen Van A',
    student_id: 'SV001',
    password: '$2a$10$hashedpassword',
    role: 'reader',
    status: 'active',
    card_expiry: Date.now() + 365 * 24 * 60 * 60 * 1000,
    phone: '0987654321',
    address: 'Hanoi',
    created_at: Date.now(),
    loans: [],
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should successfully create a new user with hashed password and active status', async () => {
      const input = {
        email: 'newuser@library.com',
        displayName: 'New User',
        password: 'password123',
        role: 'reader',
        studentId: 'SV999',
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockImplementation((dto: any) => ({ ...dto, id: 2 }));
      userRepository.save.mockImplementation(async (user: any) => user);

      const result = await service.create(input);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'newuser@library.com' } });
      expect(result).toHaveProperty('id', 2);
      expect(result.email).toBe('newuser@library.com');
      expect(result.display_name).toBe('New User');
      expect(result.status).toBe('active');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw BadRequestException if required fields are missing', async () => {
      await expect(service.create({ email: '', password: '123' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      userRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(
        service.create({
          email: 'reader@library.com',
          displayName: 'Test',
          password: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if student_id already exists', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // email check
        .mockResolvedValueOnce(mockUser); // student_id check

      await expect(
        service.create({
          email: 'another@library.com',
          displayName: 'Test',
          password: '123',
          studentId: 'SV001',
        }),
      ).rejects.toThrow('Student ID already exists');
    });

    it('should throw BadRequestException if role is invalid', async () => {
      await expect(
        service.create({
          email: 'admin@library.com',
          displayName: 'Admin',
          password: '123',
          role: 'superadmin',
        }),
      ).rejects.toThrow('Role must be either admin or reader');
    });
  });

  describe('login', () => {
    it('should authenticate user and return access token when credentials are valid', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const activeUser = { ...mockUser, password: hashedPassword };

      userRepository.findOne.mockResolvedValue(activeUser);

      const result = await service.login({
        email: 'reader@library.com',
        password: plainPassword,
      });

      expect(result).toHaveProperty('access_token', 'mock-jwt-token');
      expect(result.user.email).toBe('reader@library.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const activeUser = { ...mockUser, password: await bcrypt.hash('correct', 10) };
      userRepository.findOne.mockResolvedValue(activeUser);

      await expect(
        service.login({
          email: 'reader@library.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user does not exist or is inactive', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@library.com',
          password: 'password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if email or password is empty', async () => {
      await expect(
        service.login({ email: '', password: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all active users without passwords', async () => {
      userRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        where: { status: 'active' },
        order: { id: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('should return user if found and active', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result.email).toBe('reader@library.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update user fields successfully', async () => {
      userRepository.findOne
        .mockResolvedValueOnce({ ...mockUser }) // find current
        .mockResolvedValueOnce(null); // email conflict check (none)
      userRepository.save.mockImplementation(async (u: any) => u);

      const result = await service.update(1, {
        displayName: 'Updated Name',
        phone: '0123456789',
        status: 'active',
      });

      expect(result.display_name).toBe('Updated Name');
      expect(result.phone).toBe('0123456789');
    });

    it('should throw BadRequestException if status is invalid', async () => {
      userRepository.findOne.mockResolvedValueOnce({ ...mockUser });

      await expect(
        service.update(1, { status: 'invalid_status' }),
      ).rejects.toThrow('Status must be active or deleted');
    });

    it('should throw BadRequestException if email is already taken by another user', async () => {
      userRepository.findOne
        .mockResolvedValueOnce({ ...mockUser, id: 1 }) // target user
        .mockResolvedValueOnce({ ...mockUser, id: 2, email: 'other@library.com' }); // conflicting user

      await expect(
        service.update(1, { email: 'other@library.com' }),
      ).rejects.toThrow('Email already exists');
    });

    it('should update password, role, address, student_id, and valid card_expiry', async () => {
      userRepository.findOne.mockResolvedValueOnce({ ...mockUser });
      userRepository.save.mockImplementation(async (u: any) => u);

      const result = await service.update(1, {
        password: 'newpassword123',
        role: 'admin',
        address: 'Danang',
        studentId: 'SV-NEW',
        cardExpiry: 1800000000000,
      });

      expect(result.role).toBe('admin');
      expect(result.address).toBe('Danang');
      expect(result.student_id).toBe('SV-NEW');
      expect(result.card_expiry).toBe(1800000000000);
    });

    it('should throw BadRequestException if card_expiry is invalid', async () => {
      userRepository.findOne.mockResolvedValueOnce({ ...mockUser });

      await expect(
        service.update(1, { cardExpiry: -500 }),
      ).rejects.toThrow('card_expiry must be a valid timestamp');
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { displayName: 'Ghost' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user when user has no active loans', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        loans: [{ id: 10, status: 'Returned' }],
      });
      userRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(userRepository.update).toHaveBeenCalledWith(1, { status: 'deleted' });
      expect(result.success).toBe(true);
    });

    it('should throw BadRequestException when user has active loans', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        loans: [{ id: 10, status: 'Borrowing' }],
      });

      await expect(service.remove(1)).rejects.toThrow(
        'Cannot delete user with active book loans. Please return all books first.',
      );
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to delete does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
