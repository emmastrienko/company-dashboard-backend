import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActionsHistory } from './actions-history.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActionsHistoryService {
  constructor(
    @InjectRepository(ActionsHistory)
    private readonly historyRepository: Repository<ActionsHistory>,
  ) {}

  async logActions(params: {
    user?: User;
    actionType: string;
    targetType?: string;
    targetId?: number;
    actionDetails?: any;
  }) {
    const history = this.historyRepository.create({
      user: params.user,
      actionType: params.actionType,
      targetType: params.targetType,
      targetId: params.targetId,
      actionDetails: params.actionDetails,
    });

    await this.historyRepository.save(history);
  }

  async getUserHistory(userId: number, page = 1, limit = 20) {
    return this.historyRepository.find({
      where: { user: { id: userId } },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
  }

  async getAllHistory(page = 1, limit = 20) {
    return this.historyRepository.find({
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });
  }
}
