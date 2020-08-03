import { Redis } from '@/libs/redis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import fs from 'fs';
import moment from 'moment';
import { PaginateModel } from 'mongoose';
import { QueueService } from '../queue/queue.service';
import { EResources } from '../shared/enums/resource.enum';
import { IFile } from '../shared/interfaces/multer.interface';
import { BaseDbService } from '../shared/services/base-db.service';
import { IPromo } from './promo.interface';
@Injectable()
export class PromoService extends BaseDbService<IPromo> {
  constructor(
    @InjectModel('Promo') private model: PaginateModel<IPromo>,
    private readonly queueService: QueueService,
  ) {
    super(model);
  }

  async saveImage(image: IFile, id: string): Promise<IPromo> {
    const data = (await this.getById(id)) as IPromo;
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + data.image;
    data.image = imageString;
    try {
      await Promise.all([
        data.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern(EResources.Promo),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return data;
  }

  @Cron('0 5 * * *')
  async handleCron(): Promise<void> {
    await this.invalidatePromo();
  }

  async invalidatePromo(): Promise<void> {
    const today = moment().startOf('day');
    await Promise.all([
      this.model.updateMany(
        {
          published: true,
          validUntil: { $lte: today.toDate() },
        },
        { published: false },
      ),
      Redis.deletePattern('Promo'),
    ]);

    Logger.log('Promos invalidated', 'Cron');
  }
}
