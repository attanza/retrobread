import * as mongoose from 'mongoose';
import { generateImageLink } from '../helpers/generateImageLink';
import { IProductPackage } from './product-package.interface';
export const ProductPackageSchema = new mongoose.Schema<IProductPackage>(
  {
    name: {
      type: String,
      unique: true,
    },
    description: String,

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    price: Number,
    discountPrice: Number,
    image: String,
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

ProductPackageSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.image && obj.image !== '') {
    obj.image = generateImageLink(obj.image);
  }
  return obj;
};
