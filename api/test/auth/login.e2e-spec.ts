import faker from '@/libs/faker';
import { LoginDto } from '@/modules/auth/auth.dto';
import { EProvider } from '@/modules/auth/auth.interface';
import { RoleSchema } from '@/modules/role/role.schema';
import { CreateUserDto } from '@/modules/user/user.dto';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import { validationFailedExpect } from '../expects';
import { APP_URL, MONGO_DB_OPTIONS } from '../helper';

const URL = '/api/login';
const userData: CreateUserDto = {
  name: faker.name(),
  email: faker.email(),
  phone: faker.phone(),
  password: 'password',
  role: '',
};

const loginData: LoginDto = {
  uid: userData.email,
  password: 'password',
  provider: EProvider.LOCAL,
};

let refreshToken: string;

let User: mongoose.Model<mongoose.Document, unknown>;
let Role: mongoose.Model<mongoose.Document, unknown>;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  User = mongoose.model('User', UserSchema);
  Role = mongoose.model('Role', RoleSchema);
  const userRole = await Role.findOne({ slug: 'user' }).lean();
  userData.role = userRole._id;
  await User.create(userData);
});

afterAll(async done => {
  await User.deleteOne({ email: userData.email });
  await mongoose.disconnect(done);
});

describe('Login', () => {
  it('cannot Login if incomplete data', () => {
    return request(APP_URL)
      .post(URL)
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `uid should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot login if user is not active', () => {
    return request(APP_URL)
      .post(URL)
      .send(loginData)
      .expect(401)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('blocked user cannot login', async () => {
    await User.updateOne(
      { email: userData.email },
      { blocked: true, isActive: true },
    );
    return request(APP_URL)
      .post(URL)
      .send(loginData)
      .expect(401)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(401);
        expect(body.meta.message).toEqual('Unauthorized');
      });
  });

  it('can login', async () => {
    await User.updateOne({ email: userData.email }, { blocked: false });
    return request(APP_URL)
      .post(URL)
      .send(loginData)
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Login succeeded');
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();
        expect(body.data.refreshToken).toBeDefined();
        refreshToken = body.data.refreshToken;
      });
  });
});

describe('Refresh token', () => {
  const URL2 = '/api/refreshToken';
  it('cannot refresh token', () => {
    return request(APP_URL)
      .post(URL2)
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `refreshToken should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });

  it('can refresh token', () => {
    return request(APP_URL)
      .post(URL2)
      .send({ refreshToken })
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Refresh token succeeded');
        expect(body.data).toBeDefined();
        expect(body.data.token).toBeDefined();
        expect(body.data.refreshToken).toBeDefined();
      });
  });
  it('cannot use refresh token twice', () => {
    return request(APP_URL)
      .post(URL2)
      .send({ refreshToken })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual('Refresh token failed');
      });
  });
});
