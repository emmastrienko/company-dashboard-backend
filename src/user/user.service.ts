import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import path from 'path';
import * as fs from 'fs/promises';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  async uploadAvatar(userId: number, filename: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.avatarUrl = `/uploads/avatars/${filename}`;
    return this.userRepository.save(user);
  }

 

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'passwordHash'],
    });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) throw new BadRequestException('Incorrect current password');

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Password do not match');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    return this.userRepository.save(user);
  }
}
