import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from 'src/companies/company.entity';
import { Role } from 'src/user/role.enum';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async countUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async countCompanies(): Promise<number> {
    return this.companyRepository.count();
  }

  async getAllAdmins() {
    return this.userRepository.find({
      where: { role: Role.Admin },
      select: ['id', 'email', 'role'],
      order: { createdAt: 'DESC' },
    });
  }

  async promoteUserToAdmin(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (user.role === Role.Admin || user.role === Role.SuperAdmin) {
      throw new BadRequestException(
        `User with email ${email} is already an Admin or SuperAdmin`,
      );
    }

    user.role = Role.Admin;

    await this.userRepository.save(user);
    return user;
  }

  async demoteAdminToUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.role !== Role.Admin) {
      throw new BadRequestException(`User with ID ${userId} is not an Admin`);
    }

    user.role = Role.User;
    await this.userRepository.save(user);
    return user;
  }

  async getCompaniesSortedByCapital() {
    return await this.companyRepository.find({
      order: { capital: 'DESC' },
      relations: ['owner'],
    });
  }
}
