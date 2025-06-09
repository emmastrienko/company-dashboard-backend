import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { User } from 'src/user/user.entity';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.companiesService.create(createCompanyDto, user);
  }

  @Get()
  @Roles(Role.Admin, Role.SuperAdmin)
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: CreateCompanyDto,
    @Req() req: Request,
  ) {
    console.log('req.user:', req.user);
    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as User;
    return this.companiesService.remove(id, user);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @Roles(Role.User, Role.Admin, Role.SuperAdmin)
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new ForbiddenException('File not provided');
    }

    const user = req.user as User;

    const logoUrl = `/uploads/${file.filename}`;

    return this.companiesService.updateLogo(id, logoUrl, user);
  }
}
