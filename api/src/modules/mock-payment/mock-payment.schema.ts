import * as mongoose from 'mongoose';
import { IMockPayment } from './mock-payment.interface';
export const MockPaymentSchema = new mongoose.Schema<IMockPayment>(
  {
    provider: {
      type: String,
      unique: true,
    },
    consumers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        balance: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true },
);
