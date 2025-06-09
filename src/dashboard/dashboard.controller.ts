import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async getStats() {
    const totalUsers = await this.dashboardService.countUsers();
    const totalCompanies = await this.dashboardService.countCompanies();
    return {
      totalUsers: totalUsers,
      totalCompanies: totalCompanies,
    };
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async getAllAdmins() {
    return this.dashboardService.getAllAdmins();
  }

  @Post('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async promoteUserToAdmin(@Body() createUserDto: CreateUserDto) {
    return this.dashboardService.promoteUserToAdmin(createUserDto.email);
  }

  @Delete('admins/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async demoteAdminToUser(@Param('id') userId: number) {
    return this.dashboardService.demoteAdminToUser(userId);
  }

  @Get('companies/by-capital')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SuperAdmin)
  async getCompaniesByCapital() {
    return this.dashboardService.getCompaniesSortedByCapital();
  }
}
