import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const { email, password, role } = createUserDto;
    return this.userService.createUser(email, password, role);
  }

  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.authService.validatePassword(
      user.passwordHash,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.generateToken(user);
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.findById(id);
  }
}
