import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/user/role.enum'; // Assuming you have a Role enum defined

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(
    email: string,
    password: string,
    role: Role = Role.User,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      passwordHash: hashedPassword,
      role,
    });
    return this.userRepository.save(user);
  }

  async validatePassword(
    storedHash: string,
    inputPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(inputPassword, storedHash);
  }

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new BadRequestException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }
}
