import faker from '@/libs/faker';
import { RegisterDto } from '@/modules/auth/auth.dto';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { validationFailedExpect } from '../expects';
import { APP_URL, MONGO_DB_OPTIONS } from '../helper';

const URL = '/api/register';
const registerData: RegisterDto = {
  name: faker.name(),
  email: faker.email(),
  phone: faker.phone(),
  password: 'password',
};

let found: any;
let confirmToken: string;
let User: mongoose.Model<mongoose.Document, unknown>;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  User = mongoose.model('User', UserSchema);
});

afterAll(async done => {
  await User.deleteOne({ email: registerData.email });
  await mongoose.disconnect(done);
});

describe('Register', () => {
  it('cannot register if incomplete data', () => {
    return request(APP_URL)
      .post(URL)
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `name should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('can register', () => {
    return request(APP_URL)
      .post(URL)
      .send(registerData)
      .expect(200)
      .expect(async ({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('User registration succeeded');
        found = await User.findOne({ email: registerData.email });
        expect(found.email).toEqual(registerData.email);
        expect(found.phone).toEqual(registerData.phone);
        expect(found.password === registerData.password).toBeFalsy();
        expect(found.isActive).toBeFalsy();
        confirmToken = body.data.token;
      });
  });
  it('cannot register if duplicate', () => {
    return request(APP_URL)
      .post(URL)
      .send(registerData)
      .expect(400)
      .expect(async ({ body }) => {
        const errMessage = `email is already exists`;
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual(errMessage);
      });
  });
});

describe('User Confirmation', () => {
  it('user will not activate if wrong token', () => {
    return request(APP_URL)
      .get('/api/confirm/asdhjasd')
      .expect(400)
      .expect(async ({ body }) => {
        const errMessage = 'confirmation failed';
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual(errMessage);
      });
  });

  it('user can confirm', () => {
    return request(APP_URL)
      .get(`/api/confirm/${confirmToken}`)
      .expect(200)
      .expect(async ({ body }) => {
        const errMessage = 'User confirmed';
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual(errMessage);
        const user: IUser = await User.findById(found._id).lean();
        expect(user.isActive).toBeTruthy();
      });
  });
});
