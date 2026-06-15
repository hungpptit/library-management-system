import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Loan } from '../loans/loan.entity';

@Module({
<<<<<<< HEAD
  imports: [TypeOrmModule.forFeature([User, Loan])],
=======
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: 'library-secret-key-12345',
      signOptions: { expiresIn: '7d' },
    }),
  ],
>>>>>>> 029460e80ddf84b4eec1d8bd675f26cf26fa963b
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}

