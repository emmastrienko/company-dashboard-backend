import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { UserModule } from 'src/user/user.module';
import { ActionsHistoryModule } from 'src/actions-history/actions-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    UserModule,
    ActionsHistoryModule,
  ],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService],
})
export class CompaniesModule {}
