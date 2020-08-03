import faker from '@/libs/faker';
import { UpdateProfileDto } from '@/modules/profile/profile.dto';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  generalErrorExpect,
  showExpect,
  unauthorizedExpect,
  updateExpect,
  validationFailedExpect,
} from '../expects';
import {
  APP_URL,
  generateToken,
  generateUser,
  MONGO_DB_OPTIONS,
} from '../helper';

const URL = '/api/profile';

let User: mongoose.Model<mongoose.Document, unknown>;
let token: string;
let user: any;

const updateData: Partial<UpdateProfileDto> = {
  name: faker.name(),
  phone: faker.phone(),
};

const newPassword = 'password-password';
beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  User = mongoose.model('User', UserSchema);
  user = await generateUser(mongoose, 'user');
  token = await generateToken(User, user.email);
});

afterAll(async done => {
  await User.deleteOne({ email: user.email });
  await mongoose.disconnect(done);
});

describe(`Profile Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    return request(APP_URL)
      .get(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('can get detail', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect<IUser>(expect, body, 'Profile');
        const output = { ...body } as IApiItem<IUser>;
        const userData = user.toJSON();
        delete userData._id;
        delete userData.role;
        delete userData.createdAt;
        delete userData.updatedAt;
        Object.keys(userData).map(key => {
          expect(userData[key]).toEqual(output.data[key]);
        });
      });
  });
});

describe(`Profile Update`, () => {
  it('cannot update if not authenticated', () => {
    return request(APP_URL)
      .put(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('can update', async () => {
    return request(APP_URL)
      .put(URL)
      .set({ Authorization: `Bearer ${token}` })
      .send(updateData)
      .expect(200)
      .expect(({ body }) => {
        updateExpect<IUser>(expect, body, 'Profile');
        expect(body.data.name).toEqual(updateData.name);
        expect(body.data.phone).toEqual(updateData.phone);
      });
  });
});

describe('Change password', () => {
  const URL2 = URL + '/change-password';

  it('cannot change password if not authenticated', () => {
    return request(APP_URL)
      .post(URL2)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot change password if validation failed', () => {
    return request(APP_URL)
      .post(URL2)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `password should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot change password if less than 8 Characters', () => {
    const passwordData = {
      oldPassword: 'password',
      password: 'pass',
    };
    return request(APP_URL)
      .post(URL2)
      .set({ Authorization: `Bearer ${token}` })
      .send(passwordData)
      .expect(400)
      .expect(({ body }) => {
        const errMessage =
          'password must be longer than or equal to 8 characters';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot change password if old password incorrect', () => {
    const passwordData = {
      oldPassword: 'passwo',
      password: 'password',
    };
    return request(APP_URL)
      .post(URL2)
      .set({ Authorization: `Bearer ${token}` })
      .send(passwordData)
      .expect(400)
      .expect(({ body }) => {
        generalErrorExpect(expect, body, 'Old password incorrect');
      });
  });
  it('can change password', () => {
    const passwordData = {
      oldPassword: 'password',
      password: newPassword,
    };
    return request(APP_URL)
      .post(URL2)
      .set({ Authorization: `Bearer ${token}` })
      .send(passwordData)
      .expect(200)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(200);
        expect(body.meta.message).toEqual('Password updated');
      });
  });
  // it('cannot login with old password', () => {
  //   const credential = {
  //     uid: user.email,
  //     password: newPassword,
  //     provider: 'local',
  //   };
  //   return (
  //     request(APP_URL)
  //       .post('/api/login')
  //       .send(credential)
  //       // .expect(401)
  //       .expect(({ body }) => {
  //         console.log('body', body);
  //       })
  //   );
  // });
});
