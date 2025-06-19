import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ActionsHistoryService } from './actions-history.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';

@Controller('history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActionsHistoryController {
  constructor(private readonly historyService: ActionsHistoryService) {}

  @Get('user')
  async getUserHistory(
    @Req() req,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const userId = req.user.id;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    return this.historyService.getUserHistory(userId, pageNum, limitNum);
  }

  @Get('all')
  @Roles(Role.Admin, Role.SuperAdmin)
  async getAllHistory(@Query('page') page = '1', @Query('limit') limit = '20') {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    return this.historyService.getAllHistory(pageNum, limitNum);
  }
}
