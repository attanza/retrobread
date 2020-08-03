import { Document } from 'mongoose';

export interface IProductPackage extends Document {
  _id: string;
  name: string;
  description: string;
  products: string[];
  price: number;
  discountPrice: number;
  image: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const productPackageFillable = [
  'name',
  'description',
  'products',
  'price',
  'discountPrice',
];
