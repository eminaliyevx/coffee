import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { GetUser } from "src/decorators";
import { AccessTokenGuard, RefreshTokenGuard } from "src/guards";
import { JwtPayload } from "src/types";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.OK)
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto);
  }

  @UseGuards(AccessTokenGuard)
  @Get("logout")
  logout(@GetUser() user: JwtPayload) {
    return this.authService.logout(user.sub);
  }

  @UseGuards(RefreshTokenGuard)
  @Get("refresh")
  refreshTokens(@GetUser() user: JwtPayload & { refreshToken: string }) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
