import { IUser } from '@/modules/user/user.interface';
import { Request } from 'express';

export interface IRequest extends Request {
  user: IUser;
}
