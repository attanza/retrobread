import { Redis } from '@/libs/redis';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { BaseDbService } from '../shared/services/base-db.service';
import { ENotificationAction, INotification } from './notification.interface';
@Injectable()
export class NotificationService extends BaseDbService<INotification> {
  constructor(
    @InjectModel('Notification') private model: PaginateModel<INotification>,
  ) {
    super(model);
  }

  async getMyNotificationById(
    id: string,
    userId: string,
  ): Promise<INotification> {
    const redisKey = `Notification_${userId}_${id}`;
    const cache = await Redis.get<INotification>(redisKey);
    if (cache) {
      return cache;
    }
    const options = { _id: id, user: userId };
    const data = await this.getOneWithOptions(options);
    if (!data.isRead) {
      data.isRead = true;
      await data.save();
    }
    await Redis.set(redisKey, data.toJSON());
    return data.toJSON();
  }

  async updateMyNotification(
    ids: string[],
    userId: string,
    action: ENotificationAction,
  ): Promise<boolean> {
    const options = { isRead: false };
    if (action === ENotificationAction.READ) {
      options.isRead = true;
    }
    await this.model.updateMany({ user: userId, _id: { $in: ids } }, options);
    await Redis.deletePattern('Notification');
    return true;
  }

  async deleteMyNotifications(ids: string[], userId: string): Promise<boolean> {
    await this.model.deleteMany({ user: userId, _id: { $in: ids } });
    await Redis.deletePattern('Notification');
    return true;
  }
}
