import faker from '@/libs/faker';
import {
  ENotificationAction,
  INotification,
} from '@/modules/notification/notification.interface';
import { NotificationSchema } from '@/modules/notification/notification.schema';
import { EResources } from '@/modules/shared/enums/resource.enum';
import { UserSchema } from '@/modules/user/user.schema';
import 'dotenv/config';
import mongoose from 'mongoose';
import request from 'supertest';
import {
  deleteExpect,
  resourceListExpects,
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

const URL = '/api/my-notifications';

let Notification: mongoose.Model<mongoose.Document, unknown>;
let User: mongoose.Model<mongoose.Document, unknown>;
let found: any;
let token: string;
let user: any;
let user2: any;
let ids: string[];

beforeAll(async () => {
  const MONGOOSE_URI = `${process.env.DB_URL}/${process.env.DB_NAME}`;
  await mongoose.connect(MONGOOSE_URI, MONGO_DB_OPTIONS);
  Notification = mongoose.model('Notification', NotificationSchema);
  User = mongoose.model('User', UserSchema);
  user = await generateUser(mongoose, 'user');
  user2 = await generateUser(mongoose, 'user');
  const notificationData = [];
  for (let i = 0; i < 10; i++) {
    notificationData.push({
      user: user._id,
      title: faker.sentence(),
      content: faker.paragraph(),
      isRead: false,
      sender: user._id,
    });
  }
  await Notification.insertMany(notificationData);
  const notificationData2 = [];

  for (let i = 0; i < 5; i++) {
    notificationData2.push({
      user: user2._id,
      title: faker.sentence(),
      content: faker.paragraph(),
      isRead: false,
      sender: user2._id,
    });
  }
  await Notification.insertMany(notificationData2);
  token = await generateToken(User, user.email);
});

afterAll(async done => {
  await Notification.deleteMany({ user: user._id });
  await Notification.deleteMany({ user: user2._id });
  await User.deleteOne({ _id: user._id });
  await User.deleteOne({ _id: user2._id });
  await mongoose.disconnect(done);
});

describe(`${EResources.Notification} List`, () => {
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
        resourceListExpects(expect, body, EResources.Notification);
        for (let i = 0; i < 10; i++) {
          expect(body.data[i].user).toEqual(user._id.toString());
        }
      });
  });
});

describe(`${EResources.Notification} Detail`, () => {
  it('cannot get detail if not authenticated', async () => {
    found = await Notification.findOne({ user: user._id });
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
  it('cannot get detail if not belongs to', async () => {
    found = await Notification.findOne({ user: user2._id });
    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual('Resource not found');
      });
  });
  it('can get detail', async () => {
    found = await Notification.findOne({ user: user._id });

    return request(APP_URL)
      .get(`${URL}/${found._id}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(200)
      .expect(({ body }) => {
        showExpect<INotification>(expect, body, EResources.Notification);
        expect(body.data.user).toEqual(user._id.toString());
        expect(body.data.isRead).toBeTruthy();
      });
  });
});

describe(`${EResources.Notification} Update`, () => {
  it('cannot update if not authenticated', () => {
    return request(APP_URL)
      .put(`${URL}/${ENotificationAction.READ}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });

  it('cannot update if not validation failed', () => {
    return request(APP_URL)
      .put(`${URL}/${ENotificationAction.READ}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `ids should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });

  it('cannot update if action is invalid', async () => {
    const notifications = await Notification.find({ user: user._id })
      .limit(5)
      .lean();
    ids = notifications.map(n => n._id);
    return request(APP_URL)
      .put(`${URL}/hallo`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ ids })
      .expect(400)
      .expect(({ body }) => {
        expect(body.meta).toBeDefined();
        expect(body.meta.status).toEqual(400);
        expect(body.meta.message).toEqual(`action should be in read, unread`);
      });
  });
  it('can read all', () => {
    return request(APP_URL)
      .put(`${URL}/${ENotificationAction.READ}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ ids })
      .expect(200)
      .expect(async ({ body }) => {
        updateExpect<INotification>(expect, body, EResources.Notification);
        const notifications = (await Notification.find({
          _id: { $in: ids },
        }).lean()) as INotification[];
        notifications.map(n => {
          expect(n.user).toEqual(user._id);
          expect(n.isRead).toBeTruthy();
        });
      });
  });
  it('can unread all', () => {
    return request(APP_URL)
      .put(`${URL}/${ENotificationAction.UNREAD}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ ids })
      .expect(200)
      .expect(async ({ body }) => {
        updateExpect<INotification>(expect, body, EResources.Notification);
        const notifications = (await Notification.find({
          _id: { $in: ids },
        }).lean()) as INotification[];
        notifications.map(n => {
          expect(n.user).toEqual(user._id);
          expect(n.isRead).toBeFalsy();
        });
      });
  });
});

describe(`${EResources.Notification} Delete`, () => {
  it('cannot delete if not authenticated', () => {
    return request(APP_URL)
      .delete(`${URL}`)
      .expect(401)
      .expect(({ body }) => {
        unauthorizedExpect(expect, body);
      });
  });
  it('cannot delete if not validation failed', () => {
    return request(APP_URL)
      .delete(`${URL}`)
      .set({ Authorization: `Bearer ${token}` })
      .expect(400)
      .expect(({ body }) => {
        const errMessage = `ids should not be empty`;
        validationFailedExpect(expect, body, errMessage);
      });
  });
  it('cannot delete if ids are not belongs to', async () => {
    const notifications = await Notification.find({ user: user2._id })
      .limit(5)
      .lean();
    ids = notifications.map(n => n._id);
    return request(APP_URL)
      .delete(`${URL}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ ids })
      .expect(200)
      .expect(async ({ body }) => {
        deleteExpect(expect, body, EResources.Notification);
        const notifications2 = await Notification.find({
          user: user._id,
        }).lean();
        expect(notifications2.length).toEqual(10);
      });
  });
  it('can delete', async () => {
    const notifications = await Notification.find({ user: user._id })
      .limit(5)
      .lean();
    ids = notifications.map(n => n._id);
    return request(APP_URL)
      .delete(`${URL}`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ ids })
      .expect(200)
      .expect(async ({ body }) => {
        deleteExpect(expect, body, EResources.Notification);
        const notifications2 = await Notification.find({
          user: user._id,
        }).lean();
        expect(notifications2.length).toEqual(5);
      });
  });
});
