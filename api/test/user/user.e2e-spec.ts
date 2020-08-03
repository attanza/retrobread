import faker from '@/libs/faker';
import { RoleSchema } from '@/modules/role/role.schema';
import { EResources } from '@/modules/shared/enums/resource.enum';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { CreateUserDto } from '@/modules/user/user.dto';
import { IUser } from '@/modules/user/user.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  createExpect,
  deleteExpect,
  duplicateErrorExpect,
  forbiddenExpect,
  resourceListExpects,
  showExpect,
  unauthorizedExpect,
  updateExpect,
  validationFailedExpect,
} from '../expects';
import { APP_URL, generateToken, MONGO_DB_OPTIONS } from '../helper';

const URL = '/api/Users';
const createData: CreateUserDto = {
  name: faker.name(),
  email: faker.email(),
  phone: faker.phone(),
  role: '',
  password: 'password',
};

let User: mongoose.Model<mongoose.Document, unknown>;
let Role: mongoose.Model<mongoose.Document, unknown>;
let found: any;
let token: string;
let unauthorizedToken: string;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  User = mongoose.model('User', UserSchema);
  Role = mongoose.model('Role', RoleSchema);
  const userRole = await Role.findOne({ slug: 'user' }).lean();
  createData.role = userRole._id;
  token = await generateToken(User, 'super_administrator@retrobread.com');
  unauthorizedToken = await generateToken(User, 'user@retrobread.com');
});

afterAll(async done => {
  await User.deleteOne({ name: createData.name });
  await mongoose.disconnect(done);
});

describe(`${EResources.User} List`, () => {
  it('cannot get list if not authenticated', () => {
    return request(APP_URL)
      .get(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot get list if not unauthorized', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });
  it('can get list', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        resourceListExpects(expect, body, EResources.User);
      });
  });
});

describe(`${EResources.User} Create`, () => {
  it('cannot create if not authenticated', () => {
    return request(APP_URL)
      .post(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot create if not unauthorized', () => {
    return request(APP_URL)
      .post(URL)
      .send(createData)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });
  it('cannot create if validation failed', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `name should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });

  it('can create', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(201)
      .expect(({ body }) => {
        createExpect<IUser>(expect, body, EResources.User);
        const output = { ...body } as IApiItem<IUser>;
        const dataToCheck = { ...createData };
        delete dataToCheck.password;
        delete dataToCheck.role;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });

  it('cannot create if duplicate', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${token}` })
      .send(createData)
      .expect(400)
      .expect(({ body }) => {
        duplicateErrorExpect(expect, body, 'email');
      });
  });
});

describe(`${EResources.User} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    found = await User.findOne({ name: createData.name });

    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot get detail not unauthorized', () => {
    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot get detail if invalid mongo id', () => {
    return request(APP_URL)
      .get(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot get detail if not exists', () => {
    return request(APP_URL)
      .get(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual('Resource not found');
      });
  });
  it('can get detail', () => {
    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect<IUser>(expect, body, EResources.User);
        const output = { ...body } as IApiItem<IUser>;
        const dataToCheck = { ...createData };
        delete dataToCheck.password;
        delete dataToCheck.role;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
});

describe(`${EResources.User} Update`, () => {
  it('cannot update if not authenticated', () => {
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot update if not unauthorized', () => {
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .send(createData)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot update if invalid mongo id', () => {
    return request(APP_URL)
      .put(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot update if not exists', () => {
    return request(APP_URL)
      .put(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual('Resource not found');
      });
  });
  it('can update', async () => {
    const updatedData = { ...createData };
    updatedData.phone = faker.phone();

    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updatedData)
      .expect(200)
      .expect(({ body }) => {
        updateExpect<IUser>(expect, body, EResources.User);
        const output = { ...body } as IApiItem<IUser>;
        const dataToCheck = { ...createData };
        delete dataToCheck.password;
        delete dataToCheck.role;
        dataToCheck.phone = updatedData.phone;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
});

describe(`${EResources.User} Delete`, () => {
  it('cannot delete if not authenticated', () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot delete if not unauthorized', () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .send(createData)
      .set({ Authorization: `Bearer ${unauthorizedToken}` })
      .expect(403)
      .expect(({ body }) => {
        forbiddenExpect(expect, body);
      });
  });

  it('cannot delete if invalid mongo id', () => {
    return request(APP_URL)
      .delete(`${URL}/sfgdfg`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = 'id must be a mongodb id';
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot delete if not exists', () => {
    return request(APP_URL)
      .delete(`${URL}/5f091216ae2a140e064d2326`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual('Resource not found');
      });
  });
  it('can delete', async () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        deleteExpect<IUser>(expect, body, EResources.User);
      });
  });
});
