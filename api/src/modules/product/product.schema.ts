import * as mongoose from 'mongoose';
import { IProduct } from './product.interface';
export const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      unique: true,
    },

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        autopopulate: true,
      },
    ],
    price: Number,
    discountPrice: Number,
    images: [
      {
        url: String,
        published: Boolean,
        default: Boolean,
      },
    ],
    stock: Number,
    description: String,
  },
  { timestamps: true },
);

ProductSchema.methods.toJSON = function() {
  const obj: IProduct = this.toObject();
  if (obj.images && obj.images.length > 0) {
    obj.images.map(image => {
      const imageSplit = image.url.split(':');
      if (imageSplit.length > 1) {
        return image;
      }
      image.url = `${process.env.APP_URL}${image.url}`;
      return image;
    });
  }
  return obj;
};
