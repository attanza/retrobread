import { Document } from 'mongoose';
import { IRole } from '../role/role.interface';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: string | IRole;
  isActive: boolean;
  blocked: boolean;
  points?: number;
  avatar?: string;
  password: string;
  tokenCount: number;
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const userFillable = [
  'name',
  'email',
  'phone',
  'role',
  'isActive',
  'blocked',
  'points',
  'avatar',
  'password',
];
