import * as mongoose from 'mongoose';
import { IAddress } from './address.interface';
export const AddressSchema = new mongoose.Schema<IAddress>(
  {
    street: String,
    district: String,
    village: String,
    city: String,
    province: String,
    country: {
      type: String,
      default: 'Indonesia',
    },
    postCode: String,
    latitude: Number,
    longitude: Number,
    addressType: String,
    default: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);
