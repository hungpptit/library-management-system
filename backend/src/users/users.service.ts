import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Loan } from '../loans/loan.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
  ) {}

  private sanitizeUser(user: User) {
    const { password, ...rest } = user as any;
    return rest as User;
  }

  async create(userData: any): Promise<User> {
    const email = (userData.email || '').trim().toLowerCase();
    const displayName = (userData.displayName || userData.display_name || '').trim();
    const studentId = (userData.studentId || userData.student_id || '').trim();
    let password = (userData.password || '').trim();
    const role = (userData.role || 'reader').trim().toLowerCase();

    if (!email || !displayName || !studentId) {
      throw new BadRequestException('Missing required user fields');
    }

    if (!password) {
      // password = Math.random().toString(36).slice(2, 10);
      password = '123'; // Default password for demo purposes
    }

    const existingEmail = await this.userRepository.findOne({ where: { email } });
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingStudentId = studentId
      ? await this.userRepository.findOne({ where: { student_id: studentId } })
      : null;

    if (existingStudentId) {
      throw new ConflictException('Student ID already exists');
    }

    const phone = userData.phone ? userData.phone.trim() : null;
    const address = userData.address ? userData.address.trim() : null;

    const user = this.userRepository.create({
      email,
      display_name: displayName,
      student_id: studentId,
      phone,
      address,
      role: role === 'admin' ? 'admin' : 'reader',
      password,
      created_at: Date.now(),
    });

    const savedUser = await this.userRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email: email.trim().toLowerCase() } });
    return user || null;
  }

  async login(email: string, password: string): Promise<User> {
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userRepository.findOne({ where: { email: normalizedEmail } });
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.sanitizeUser(user);
  }

  async update(id: number, userData: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (userData.email && userData.email.trim().toLowerCase() !== user.email) {
      const existingEmail = await this.userRepository.findOne({ where: { email: userData.email.trim().toLowerCase() } });
      if (existingEmail && existingEmail.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    if (userData.studentId && userData.studentId.trim() !== user.student_id) {
      const existingStudentId = await this.userRepository.findOne({ where: { student_id: userData.studentId.trim() } });
      if (existingStudentId && existingStudentId.id !== id) {
        throw new ConflictException('Student ID already exists');
      }
    }

    const updatedUser = {
      ...user,
      email: userData.email ? userData.email.trim().toLowerCase() : user.email,
      display_name: userData.displayName ? userData.displayName.trim() : user.display_name,
      student_id: userData.studentId ? userData.studentId.trim() : user.student_id,
      phone: userData.phone !== undefined ? (String(userData.phone).trim() || null) : user.phone,
      address: userData.address !== undefined ? (String(userData.address).trim() || null) : user.address,
      role: userData.role ? userData.role.trim().toLowerCase() : user.role,
      password: userData.password ? userData.password.trim() : user.password,
    };

    await this.userRepository.save(updatedUser);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const activeLoan = await this.loanRepository.findOne({
      where: {
        reader_id: id,
        status: 'Borrowing',
      },
    });

    if (activeLoan) {
      throw new BadRequestException('Cannot delete user with active borrowing records. Return books first.');
    }

    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}
