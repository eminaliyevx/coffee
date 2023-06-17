import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsStrongPassword } from "class-validator";

export class AuthDto {
  @ApiProperty()
  @IsMobilePhone("az-AZ")
  phone: string;

  @ApiProperty()
  @IsStrongPassword()
  password: string;
}
