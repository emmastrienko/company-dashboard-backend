import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';
import { User } from 'src/user/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
