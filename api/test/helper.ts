export const APP_URL = 'http://localhost:10000';
import faker from '@/libs/faker';
import { RoleSchema } from '@/modules/role/role.schema';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import jwt from 'jsonwebtoken';
import mongoose, { Mongoose } from 'mongoose';

export const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

export async function generateToken(
  User: mongoose.Model<mongoose.Document, unknown>,
  email: string,
): Promise<string> {
  const APP_SECRET = process.env.APP_SECRET;
  const user: IUser = await User.findOne({ email }).lean();
  return jwt.sign({ uid: user._id, tokenCount: user.tokenCount }, APP_SECRET);
}

export async function generateUser(
  mongoose: Mongoose,
  slug: string,
): Promise<IUser> {
  const User = mongoose.model('User', UserSchema);
  const Role = mongoose.model('Role', RoleSchema);
  const role = await Role.findOne({ slug });
  const user = await User.create({
    name: faker.name(),
    email: faker.email(),
    phone: faker.phone(),
    role: role._id,
    password: 'password',
    isActive: true,
  });
  return user;
}
