import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
import { IPermission } from './permission.interface';
export const PermissionSchema = new mongoose.Schema<IPermission>(
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

PermissionSchema.pre<IPermission>('save', function(
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
