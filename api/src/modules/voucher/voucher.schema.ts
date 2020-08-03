import * as mongoose from 'mongoose';
import { generateImageLink } from '../helpers/generateImageLink';
import { IVoucher } from './voucher.interface';

export const VoucherSchema = new mongoose.Schema<IVoucher>(
  {
    code: String,
    title: String,
    description: String,
    isOneTime: Boolean,
    validFrom: Date,
    validUntil: Date,
    days: [Number],
    startHour: String,
    endHour: String,
    consumers: [
      {
        _id: false,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        usedAt: Date,
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    productPackages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductPackage',
      },
    ],
    voucherType: String,
    voucherValue: String,
    valid: {
      type: Boolean,
      default: true,
    },
    image: String,
  },
  { timestamps: true },
);

VoucherSchema.index({ code: 1 });

VoucherSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
