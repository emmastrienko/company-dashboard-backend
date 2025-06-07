import { IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Role } from '../../user/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
