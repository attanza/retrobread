import { Redis } from '@/libs/redis';
import { IUser } from '@/modules/user/user.interface';
import { UserService } from '@/modules/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  uid: string;
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.APP_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<IUser> {
    const { uid, tokenCount } = payload;
    this.uid = uid;
    const redisKey = `Authorized_${uid}`;
    const cache = await Redis.get<IUser>(redisKey);
    if (cache) {
      return cache;
    }
    const user = await this.userService.getByIdWithRolePermissions(uid);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isActive) {
      throw new UnauthorizedException();
    }
    if (user.blocked) {
      throw new UnauthorizedException();
    }

    if (user.tokenCount !== tokenCount) {
      throw new UnauthorizedException();
    }
    await Redis.set(redisKey, user, 60 * 10);
    return user;
  }
}
