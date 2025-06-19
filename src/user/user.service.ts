import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActionsHistoryService } from 'src/actions-history/actions-history.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly historyService: ActionsHistoryService,
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
    const updatedUser = await this.findById(id);

    await this.historyService.logActions({
      user: updatedUser,
      actionType: 'UPDATE_PROFILE',
      targetType: 'User',
      targetId: updatedUser.id,
      actionDetails: { updatedFields: Object.keys(data) },
    });

    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.historyService.logActions({
      user,
      actionType: 'DELETE_USER',
      targetType: 'User',
      targetId: user.id,
      actionDetails: { email: user.email },
    });

    return this.userRepository.remove(user);
  }

  async uploadAvatar(userId: number, filename: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.avatarUrl = `/uploads/avatars/${filename}`;
    const savedUser = await this.userRepository.save(user);

    await this.historyService.logActions({
      user,
      actionType: 'UPDATE_AVATAR',
      targetType: 'User',
      targetId: user.id,
      actionDetails: { avatarUrl: user.avatarUrl },
    });

    return savedUser;
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
    const updatedUser = await this.userRepository.save(user);

    await this.historyService.logActions({
      user: { id: userId } as User,
      actionType: 'CHANGE_PASSWORD',
      targetType: 'User',
      targetId: userId,
      actionDetails: null,
    });

    return updatedUser;
  }
}
