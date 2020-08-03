import * as mongoose from 'mongoose';
import { generateImageLink } from '../helpers/generateImageLink';
import { IPromo } from './promo.interface';

export const PromoSchema = new mongoose.Schema<IPromo>(
  {
    title: String,
    subtitle: String,
    validFrom: Date,
    validUntil: Date,
    description: String,
    published: Boolean,
    image: String,
  },
  { timestamps: true },
);

PromoSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
