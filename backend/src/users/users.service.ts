import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users = []; // Temporary mock data

  create(user: any) {
    this.users.push(user);
    return 'User created successfully';
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, user: any) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
