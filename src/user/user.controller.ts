import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.findById(id);
  }
}
