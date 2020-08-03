import * as mongoose from 'mongoose';
import { IOrder } from './order.interface';
export const OrderSchema = new mongoose.Schema<IOrder>(
  {
    orderId: {
      type: String,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    packages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductPackage',
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    status: String,
    amount: Number,
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Voucher',
    },
    courier: String,
    payWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockPayment',
    },
    histories: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedValues: String,
      },
    ],
  },
  { timestamps: true },
);
