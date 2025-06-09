import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateAdminRoleDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
