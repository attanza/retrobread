import { Logger, UnauthorizedException } from '@nestjs/common';
import { IUser } from '../user/user.interface';

export async function checkAuthorizedUser(user: IUser): Promise<IUser> {
  if (!user) {
    Logger.log('No user', 'Auth');
    throw new UnauthorizedException();
  }
  if (!user.isActive) {
    Logger.log('Not active', 'Auth');
    throw new UnauthorizedException();
  }
  if (user.blocked) {
    Logger.log('Blocked', 'Auth');
    throw new UnauthorizedException();
  }

  return user;
}
