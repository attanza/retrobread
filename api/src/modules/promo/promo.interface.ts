import { Document } from 'mongoose';

export interface IPromo extends Document {
  _id: string;
  title: string;
  subtitle: string;
  validFrom: Date;
  validUntil: Date;
  description: string;
  published: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export const promoFillable = [
  'title',
  'subtitle',
  'validFrom',
  'validUntil',
  'description',
  'published',
];
