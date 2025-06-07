import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, data: UpdateUserDto) {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return this.userRepository.remove(user);
  }
}
