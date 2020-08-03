import { Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
export const permissionFillable = ['name', 'description'];
