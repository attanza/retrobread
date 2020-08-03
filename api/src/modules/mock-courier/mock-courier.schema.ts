import * as mongoose from 'mongoose';
import { IMockCourier } from './mock-courier.interface';
export const MockCourierSchema = new mongoose.Schema<IMockCourier>(
  {
    provider: {
      type: String,
      unique: true,
    },
    price: Number,
  },
  { timestamps: true },
);
