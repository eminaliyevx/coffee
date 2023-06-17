import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsMobilePhone,
  IsNotEmpty,
  IsStrongPassword,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsMobilePhone("az-AZ")
  phone: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;

  refreshToken?: string;
}
