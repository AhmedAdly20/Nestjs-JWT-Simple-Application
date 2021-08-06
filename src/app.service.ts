import { User } from './user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private readonly _userRepositry: Repository<User>,
    ) {}

  async register(data: any): Promise<User> {
    return this._userRepositry.save(data);
  }

  async findOne(condition: any): Promise<User> {
    return this._userRepositry.findOne(condition);
  }
}
