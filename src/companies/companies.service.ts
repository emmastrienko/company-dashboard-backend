import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from 'src/user/user.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    const company = this.companyRepository.create({
      ...createCompanyDto,
      owner,
    });
    return this.companyRepository.save(company);
  }

  async findAll() {
    return this.companyRepository.find({ relations: ['owner'] });
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

  async findByUser(user: User) {
    return this.companyRepository.find({
      where: { owner: { id: user.id } },
      relations: ['owner'],
    });
  }

  async update(id: number, UpdateCompanyDto, user: User) {
    const company = await this.findOne(id);

    if (
      company.owner.id !== user.id &&
      user.role !== 'Admin' &&
      user.role !== 'SuperAdmin'
    ) {
      throw new ForbiddenException(`You are not the owner of this company`);
    }

    Object.assign(company, UpdateCompanyDto);
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
  }
}
