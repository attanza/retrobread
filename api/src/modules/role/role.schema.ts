import { paramCase } from 'change-case';
import * as mongoose from 'mongoose';
import { IRole } from './role.interface';
export const RoleSchema = new mongoose.Schema<IRole>(
  {
    name: {
      type: String,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    description: String,
  },
  { timestamps: true },
);

RoleSchema.pre<IRole>('save', function(next: mongoose.HookNextFunction) {
  try {
    if (this.isModified('name')) {
      this.slug = paramCase(this.name);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});
