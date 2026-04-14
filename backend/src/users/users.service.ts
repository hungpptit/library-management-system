import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private normalizeRole(roleValue: unknown): 'admin' | 'reader' {
    const role = String(roleValue || 'reader').trim().toLowerCase();
    if (role !== 'admin' && role !== 'reader') {
      throw new BadRequestException('Role must be either admin or reader');
    }
    return role;
  }

  async create(userData: any) {
    const email = (userData.email || '').trim().toLowerCase();
    const displayName = (userData.display_name || userData.displayName || '').trim();
    const studentId = (userData.student_id || userData.studentId || '').trim();
    const password = (userData.password || '').trim();
    const role = this.normalizeRole(userData.role);

    if (!email || !displayName || !password) {
      throw new BadRequestException('Email, display name and password are required');
    }

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.userRepository.create({
      email,
      display_name: displayName,
      student_id: studentId || undefined,
      password,
      role,
      created_at: Date.now(),
    });

    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async login(loginData: { email: string; password: string }) {
    const email = (loginData.email || '').trim().toLowerCase();
    const password = (loginData.password || '').trim();

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.userRepository.findOne({ 
      where: { 
        email,
        status: 'active'
      } 
    });
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.sanitizeUser(user);
  }

  async findAll() {
    const users = await this.userRepository.find({
      where: { status: 'active' },
      order: { id: 'ASC' },
    });
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, status: 'active' },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async update(id: number, userData: any) {
    const user = await this.userRepository.findOne({
      where: { id, status: 'active' },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (userData.email) {
      const email = String(userData.email).trim().toLowerCase();
      const emailOwner = await this.userRepository.findOne({ where: { email } });
      if (emailOwner && emailOwner.id !== id) {
        throw new BadRequestException('Email already exists');
      }
      user.email = email;
    }

    if (userData.display_name || userData.displayName) {
      user.display_name = String(
        userData.display_name || userData.displayName,
      ).trim();
    }

    if (userData.student_id || userData.studentId) {
      user.student_id = String(userData.student_id || userData.studentId).trim();
    }

    if (userData.password) {
      user.password = String(userData.password).trim();
    }

    if (userData.role) {
      user.role = this.normalizeRole(userData.role);
    }

    const saved = await this.userRepository.save(user);
    return this.sanitizeUser(saved);
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['loans'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const activeStatuses = ['Borrowing', 'Overdue'];
    const hasActiveLoans = (user.loans || []).some(
      (loan) => activeStatuses.includes(loan.status),
    );

    if (hasActiveLoans) {
      throw new BadRequestException(
        'Cannot delete user with active book loans. Please return all books first.',
      );
    }

    // Perform soft delete by updating status
    await this.userRepository.update(id, { status: 'deleted' });
    return { success: true, message: 'User deactivated successfully' };
  }
}
