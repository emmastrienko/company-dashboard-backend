import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from 'src/user/user.entity';
import { ActionsHistoryService } from 'src/actions-history/actions-history.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly historyService: ActionsHistoryService,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    userPayload: { email: string; role: string },
  ) {
    const owner = await this.userRepository.findOne({
      where: { email: userPayload.email },
    });
    if (!owner) {
      throw new NotFoundException(
        `User with email ${userPayload.email} does not exist`,
      );
    }

    if (!createCompanyDto.name || !createCompanyDto.name.trim()) {
      throw new BadRequestException('Company name is required');
    }

    const company = this.companyRepository.create({
      ...createCompanyDto,
      owner,
    });

    const savedCompany = await this.companyRepository.save(company);

    await this.historyService.logActions({
      user: owner,
      actionType: 'CREATE_COMPANY',
      targetType: 'Company',
      targetId: savedCompany.id,
      actionDetails: { name: savedCompany.name },
    });

    return savedCompany;
  }

  async findAll(
    page: number,
    limit: number,
    sortBy: string,
    order: 'ASC' | 'DESC',
  ) {
    const [data, total] = await this.companyRepository.findAndCount({
      relations: ['owner'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: order },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id}  does not exist`);
    }
    return company;
  }

  async findByUser(user: User, page = 1, limit = 10) {
    const [data, total] = await this.companyRepository.findAndCount({
      where: { owner: { id: user.id } },
      relations: ['owner'],
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      pageCount: Math.ceil(total / limit),
    };
  }

  async update(
    id: number,
    updateCompanyDto: Partial<CreateCompanyDto>,
    user: User,
  ) {
    const company = await this.findOne(id);

    if (
      company.owner.id !== user.id &&
      user.role !== 'Admin' &&
      user.role !== 'SuperAdmin'
    ) {
      throw new ForbiddenException(`You are not the owner of this company`);
    }

    Object.assign(company, updateCompanyDto);

    await this.historyService.logActions({
      user,
      actionType: 'UPDATE_COMPANY',
      targetType: 'Company',
      targetId: company.id,
      actionDetails: updateCompanyDto,
    });

    return this.companyRepository.save(company);
  }

  async remove(id: number, user: User) {
    const company = await this.findOne(id);

    if (
      company.owner.id !== user.id &&
      user.role !== 'Admin' &&
      user.role !== 'SuperAdmin'
    ) {
      throw new ForbiddenException(`You are not the owner of this company`);
    }

    await this.historyService.logActions({
      user,
      actionType: 'DELETE_COMPANY',
      targetType: 'Company',
      targetId: company.id,
      actionDetails: { name: company.name },
    });

    return this.companyRepository.remove(company);
  }

  async updateLogo(id: number, logoUrl: string, user: User) {
    const company = await this.findOne(id);

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} does not exist`);
    }

    if (
      company.owner.id !== user.id &&
      user.role !== 'Admin' &&
      user.role !== 'SuperAdmin'
    ) {
      throw new ForbiddenException(`You are not the owner of this company`);
    }
    await this.companyRepository.update(id, { logoUrl });

    await this.historyService.logActions({
      user,
      actionType: 'UPDATE_LOGO',
      targetType: 'Company',
      targetId: company.id,
      actionDetails: { logoUrl },
    });
  }
}
