import faker from '@/libs/faker';
import { CreateAddressDto } from '@/modules/Address/Address.dto';
import { EAddressType, IAddress } from '@/modules/Address/Address.interface';
import { AddressSchema } from '@/modules/Address/Address.schema';
import { EResources } from '@/modules/shared/enums/resource.enum';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  createExpect,
  deleteExpect,
  resourceListExpects,
  showExpect,
  unauthorizedExpect,
  updateExpect,
  validationFailedExpect,
} from '../expects';
import { APP_URL, generateToken, MONGO_DB_OPTIONS } from '../helper';

const URL = '/api/my-addresses';
const createData: CreateAddressDto = {
  street: faker.street(),
  district: faker.state(),
  village: faker.state(),
  user: '',
  city: faker.city(),
  province: faker.province(),
  country: faker.country(),
  postCode: faker.postcode(),
  latitude: faker.latitude(),
  longitude: faker.longitude(),
  addressType: EAddressType.Home,
  default: true,
};

let Address: mongoose.Model<mongoose.Document, unknown>;
let User: mongoose.Model<mongoose.Document, unknown>;
let found: any;
let token: string;
let user: any;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Address = mongoose.model('Address', AddressSchema);
  User = mongoose.model('User', UserSchema);
  user = await User.findOne();
  createData.user = user._id;
  token = await generateToken(User, user.email);
});

afterAll(async done => {
  await Address.deleteOne({ street: createData.street });
  await mongoose.disconnect(done);
});

describe(`${EResources.Address} List`, () => {
  it('cannot get list if not authenticated', () => {
    return request(APP_URL)
      .get(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('can get list', () => {
    return request(APP_URL)
      .get(URL)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        resourceListExpects(expect, body, EResources.Address);
        expect(body.data[0].user).toEqual(user._id.toString());
      });
  });
});

describe(`${EResources.Address} Create`, () => {
  it('cannot create if not authenticated', () => {
    return request(APP_URL)
      .post(URL)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('cannot create if validation failed', () => {
    return request(APP_URL)
      .post(URL)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `street should not be empty`;
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
        createExpect<IAddress>(expect, body, EResources.Address);
        const output = { ...body } as IApiItem<IAddress>;
        const dataToCheck = { ...createData };
        delete dataToCheck.user;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
        expect(body.data.user).toEqual(user._id.toString());
      });
  });
});

describe(`${EResources.Address} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    found = await Address.findOne({ street: createData.street });

    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
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
      .get(`${URL}/5f091216ae2a140e064d2329`)
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
        showExpect<IAddress>(expect, body, EResources.Address);
        const output = { ...body } as IApiItem<IAddress>;
        const dataToCheck = { ...createData };
        delete dataToCheck.user;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
        expect(body.data.user).toEqual(user._id.toString());
      });
  });
});

describe(`${EResources.Address} Update`, () => {
  it('cannot update if not authenticated', () => {
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
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
      .put(`${URL}/5f091216ae2a140e064d2329`)
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
    updatedData.postCode = faker.postcode();
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updatedData)
      .expect(200)
      .expect(({ body }) => {
        updateExpect<IAddress>(expect, body, EResources.Address);
        const output = { ...body } as IApiItem<IAddress>;
        const dataToCheck = { ...createData };
        delete dataToCheck.user;
        delete dataToCheck.postCode;
        delete dataToCheck.postCode;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
        expect(body.data.postCode).toEqual(updatedData.postCode);
        expect(body.data.user).toEqual(user._id.toString());
      });
  });
});

describe(`${EResources.Address} Delete`, () => {
  it('cannot delete if not authenticated', () => {
    return request(APP_URL)
      .delete(`${URL}/${found._id}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
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
        deleteExpect<IAddress>(expect, body, EResources.Address);
      });
  });
});
