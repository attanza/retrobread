import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
import { ICategory } from './category.interface';
export const CategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: String,
  },
  { timestamps: true },
);

CategorySchema.pre<ICategory>('save', function(
  next: mongoose.HookNextFunction,
) {
  try {
    if (this.isModified('name')) {
      this.slug = paramCase(this.name);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});
