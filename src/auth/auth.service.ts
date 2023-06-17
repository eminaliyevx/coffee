import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { UserService } from "src/user/user.service";
import { compare, hash } from "src/utils";
import { AuthDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    const tokens = await this.getTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      otp: "1234",
    };
  }

  async login({ phone, password }: AuthDto) {
    const user = await this.userService.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const valid = await compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException();
    }

    const tokens = await this.getTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: number) {
    await this.userService.update({
      data: { refreshToken: null },
      where: { id: userId },
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const refreshTokenHash = await hash(refreshToken);

    await this.userService.update({
      data: { refreshToken: refreshTokenHash },
      where: { id: userId },
    });
  }

  async getTokens({ id, phone }: User) {
    const payload = { sub: id, phone };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
        expiresIn: "7d",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn: "30d",
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findUnique({ where: { id: userId } });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException();
    }

    const valid = await compare(refreshToken, user.refreshToken);

    if (!valid) {
      throw new ForbiddenException();
    }

    const tokens = await this.getTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
