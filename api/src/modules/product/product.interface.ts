import { Document } from 'mongoose';
import { ICategory } from '../category/category.interface';

export interface IProductImage {
  _id?: string;
  url: string;
  published?: boolean;
  default?: boolean;
}

export interface IProduct extends Document {
  _id: string;
  name: string;
  categories: string[] | ICategory[];
  price: number;
  discountPrice: number;
  images: IProductImage[];
  stock: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export const productFillable = [
  'name',
  'categories',
  'price',
  'discountPrice',
  'images',
  'stock',
  'description',
];

export const productImageFillable = ['published', 'default'];
