import { Document } from 'mongoose';

export enum EVoucherType {
  percentage = 'percentage',
  amount = 'amount',
  freeDelivery = 'freeDelivery',
  productCategory = 'productCategory',
}

export enum EDays {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
}

export interface IVoucherConsumer {
  user: string;
  usedAt?: Date;
}

export interface IVoucher extends Document {
  _id: string;
  code: string;
  title: string;
  description: string;
  isOneTime: boolean;
  validFrom: Date;
  validUntil: Date;
  days: EDays[];
  startHour: string;
  endHour: string;
  consumers: IVoucherConsumer[];
  products: string[];
  productPackages: string[];
  voucherType: EVoucherType;
  voucherValue: string;
  valid: boolean;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export const voucherFillable = [
  'code',
  'title',
  'description',
  'isOneTime',
  'validFrom',
  'validUntil',
  'days',
  'startHour',
  'endHour',
  'consumer',
  'products',
  'productPackages',
  'voucherType',
  'voucherValue',
  'valid',
  'image',
];
