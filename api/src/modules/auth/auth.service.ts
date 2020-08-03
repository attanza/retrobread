import { Redis } from '@/libs/redis';
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import randomstring from 'randomstring';
import { v4 } from 'uuid';
import { checkAuthorizedUser } from '../helpers/checkAuthorizedUser';
import { RoleService } from '../role/role.service';
import { EResources } from '../shared/enums/resource.enum';
import { IUser, userFillable } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './auth.dto';
import {
  JwtPayload,
  LoginData,
  RefreshTokenPayload,
  RegisterOutput,
} from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginData> {
    const { uid, password } = loginDto;
    const user = await this.userService.getByUid(uid);
    await checkAuthorizedUser(user);
    const compared = await compare(password, user.password);
    if (!compared) {
      throw new UnauthorizedException();
    }
    await Redis.del(`Authorized_${user._id}`);
    return this.generateToken(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<LoginData> {
    const { refreshToken } = refreshTokenDto;
    const { uid, tokenCount, token } = (await this.jwtService.verify(
      refreshToken,
    )) as RefreshTokenPayload;
    const user = await this.userService.findById(uid);
    await checkAuthorizedUser(user);
    if (user.tokenCount !== tokenCount) {
      Logger.log('token count invalid', 'Auth');
      throw new BadRequestException('Refresh token failed');
    }
    if (user.refreshToken !== token) {
      Logger.log('token invalid', 'Auth');
      throw new BadRequestException('Refresh token failed');
    }
    return this.generateToken(user);
  }

  async generateToken(user: IUser): Promise<LoginData> {
    user.tokenCount += 1;
    user.refreshToken = v4();
    await user.save();
    const tokenPayload: JwtPayload = {
      uid: user._id,
      tokenCount: user.tokenCount,
    };
    const token = await this.jwtService.sign(tokenPayload, { expiresIn: '1h' });
    const refreshTokenPayload: RefreshTokenPayload = {
      ...tokenPayload,
      token: user.refreshToken,
    };
    const refreshToken = await this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    });
    return { token, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<RegisterOutput> {
    const userRole = await this.roleService.getRoleBySlug('user');
    const user = await this.userService.create({
      createDto: { ...registerDto, role: userRole._id },
      resource: EResources.User,
      uniques: ['email', 'phone'],
      fillable: userFillable,
    });
    const token = v4();
    await Redis.set(token, user._id, 60 * 60 * 24);
    // TODO: send notification
    return { token };
  }

  async confirm(token: string): Promise<void> {
    try {
      const userId = await Redis.get<string>(token);
      if (!token) {
        throw new BadRequestException('confirmation failed');
      }
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new BadRequestException('confirmation failed');
      }
      user.isActive = true;
      await user.save();
      await Redis.del(token);
    } catch (error) {
      throw new BadRequestException('confirmation failed');
    }
  }

  async forgotPassword(uid: string): Promise<boolean> {
    if (!uid) {
      return false;
    }
    const user = await this.userService.getByUid(uid);
    if (!user) {
      return false;
    }
    const newPassword = randomstring.generate(8);
    // TODO: send notification
    const hashPassword = await hash(newPassword, 12);
    user.password = hashPassword;
    await user.save();
    return true;
  }
}
