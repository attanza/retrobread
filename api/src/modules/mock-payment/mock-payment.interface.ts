import { Document } from 'mongoose';

export interface IPaymentConsumers {
  user: string;
  balance: number;
}

export interface IMockPayment extends Document {
  _id: string;
  provider: string;
  consumers: IPaymentConsumers[];
  createdAt: Date;
  updatedAt: Date;
}

export const mockPaymentFillable = ['provider', 'consumers'];
