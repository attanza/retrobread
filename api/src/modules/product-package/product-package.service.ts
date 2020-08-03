import { Redis } from '@/libs/redis';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { PaginateModel } from 'mongoose';
import { QueueService } from '../queue/queue.service';
import { IFile } from '../shared/interfaces/multer.interface';
import { BaseDbService } from '../shared/services/base-db.service';
import { IProductPackage } from './product-package.interface';

@Injectable()
export class ProductPackageService extends BaseDbService<IProductPackage> {
  constructor(
    @InjectModel('ProductPackage')
    private model: PaginateModel<IProductPackage>,
    private readonly queueService: QueueService,
  ) {
    super(model);
  }

  async saveImage(image: IFile, id: string): Promise<IProductPackage> {
    const productProductPackage = (await this.getById(id)) as IProductPackage;
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + productProductPackage.image;
    productProductPackage.image = imageString;
    try {
      await Promise.all([
        productProductPackage.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern('ProductPackage'),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return productProductPackage;
  }
}
