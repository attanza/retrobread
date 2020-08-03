import { Document } from 'mongoose';

export interface IRole extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const roleFillable = ['name', 'description'];
