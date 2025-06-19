import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionsHistory } from './actions-history.entity';
import { ActionsHistoryService } from './actions-history.service';
import { ActionsHistoryController } from './action-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActionsHistory])],
  providers: [ActionsHistoryService],
  controllers: [ActionsHistoryController],
  exports: [ActionsHistoryService],
})
export class ActionsHistoryModule {}
