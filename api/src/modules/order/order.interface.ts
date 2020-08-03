import { Document } from 'mongoose';

export enum EOrderStatus {
  new = 'new',
  accepted = 'accepted',
  processing = 'processing',
  deliver = 'deliver',
  completed = 'completed',
  cancel = 'cancel',
  rejected = 'rejected',
}

export interface EOrderHistory {
  user: string;
  updatedValues: string;
}

export interface IOrder extends Document {
  _id: string;
  orderId: string;
  products: string[];
  packages: string[];
  user: string;
  address: string;
  status: EOrderStatus;
  amount: number;
  voucher: string;
  courier: string;
  payWith: string;
  histories: EOrderHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export const orderFillable = [
  'orderId',
  'products',
  'packages',
  'user',
  'status',
  'amount',
  'voucher',
  'courier',
  'payWith',
  'address',
];
