import { hash } from 'bcryptjs';
import * as mongoose from 'mongoose';
import { generateImageLink } from '../helpers/generateImageLink';
import { IUser } from './User.interface';
export const UserSchema = new mongoose.Schema<IUser>(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    points: Number,
    avatar: String,
    password: String,
    tokenCount: {
      type: Number,
      default: 0,
    },
    refreshToken: String,
  },
  { timestamps: true },
);

UserSchema.pre<IUser>('save', async function(next: mongoose.HookNextFunction) {
  try {
    if (this.isModified('password')) {
      this.password = await hash(this.password, 12);
    }
    return next();
  } catch (e) {
    return next(e);
  }
});

UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.tokenCount;
  delete obj.refreshToken;
  if (obj.avatar && obj.avatar !== '') {
    obj.avatar = generateImageLink(obj.avatar);
  }
  return obj;
};
