import faker from '@/libs/faker';
import { EResources } from '@/modules/shared/enums/resource.enum';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { UserSchema } from '@/modules/user/user.schema';
import { CreateVoucherDto } from '@/modules/voucher/voucher.dto';
import { EVoucherType, IVoucher } from '@/modules/voucher/voucher.interface';
import { VoucherSchema } from '@/modules/voucher/voucher.schema';
import 'dotenv/config';
import moment from 'moment';
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
const URL = '/api/vouchers';
const createData: Partial<CreateVoucherDto> = {
  code: faker.bb_pin(),
  title: faker.sentence(),
  description: faker.sentence(),
  isOneTime: false,
  validFrom: moment('2020-07-01').toDate(),
  validUntil: moment('2020-07-27').toDate(),
  voucherType: EVoucherType.amount,
  voucherValue: '5000',
  valid: true,
  days: [],
  consumers: [],
  products: [],
  productPackages: [],
};

let Voucher: mongoose.Model<mongoose.Document, unknown>;
let User: mongoose.Model<mongoose.Document, unknown>;
let found: any;
let token: string;
let unauthorizedToken: string;

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Voucher = mongoose.model('Voucher', VoucherSchema);
  User = mongoose.model('User', UserSchema);

  token = await generateToken(User, 'super_administrator@retrobread.com');
  unauthorizedToken = await generateToken(User, 'user@retrobread.com');
});

afterAll(async done => {
  await Voucher.deleteOne({ code: createData.code });
  await mongoose.disconnect(done);
});

describe(`${EResources.Voucher} List`, () => {
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
        resourceListExpects(expect, body, EResources.Voucher);
      });
  });
});

describe(`${EResources.Voucher} Create`, () => {
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
        const errMessage = `code should not be empty`;
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
        createExpect<IVoucher>(expect, body, EResources.Voucher);
        const output = { ...body } as IApiItem<IVoucher>;
        const dataToCheck = { ...createData };
        delete dataToCheck.validFrom;
        delete dataToCheck.validUntil;
        delete dataToCheck.isOneTime;
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
        duplicateErrorExpect(expect, body, 'voucher code');
      });
  });
});

describe(`${EResources.Voucher} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    found = await Voucher.findOne({ code: createData.code });

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
        showExpect<IVoucher>(expect, body, EResources.Voucher);
        const output = { ...body } as IApiItem<IVoucher>;
        const dataToCheck = { ...createData };
        delete dataToCheck.validFrom;
        delete dataToCheck.validUntil;
        delete dataToCheck.isOneTime;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
});

describe(`${EResources.Voucher} Update`, () => {
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
    updatedData.description = faker.sentence();
    return request(APP_URL)
      .put(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(updatedData)
      .expect(200)
      .expect(({ body }) => {
        updateExpect<IVoucher>(expect, body, EResources.Voucher);
        const output = { ...body } as IApiItem<IVoucher>;
        const dataToCheck = { ...updatedData };
        delete dataToCheck.validFrom;
        delete dataToCheck.validUntil;
        delete dataToCheck.isOneTime;
        Object.keys(dataToCheck).map(key => {
          expect(output.data[key]).toEqual(dataToCheck[key]);
        });
      });
  });
});

describe(`${EResources.Voucher} Delete`, () => {
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
        deleteExpect<IVoucher>(expect, body, EResources.Voucher);
      });
  });
});
