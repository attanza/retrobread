import { Redis } from '@/libs/redis';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { isMongoId } from 'class-validator';
import * as fs from 'fs';
import moment from 'moment';
import { PaginateModel } from 'mongoose';
import { ProductPackageService } from '../product-package/product-package.service';
import { ProductService } from '../product/product.service';
import { QueueService } from '../queue/queue.service';
import { IFile } from '../shared/interfaces/multer.interface';
import { BaseDbService } from '../shared/services/base-db.service';
import { UserService } from '../user/user.service';
import { EDays, IVoucher, IVoucherConsumer } from './voucher.interface';
@Injectable()
export class VoucherService extends BaseDbService<IVoucher> {
  private logger = new Logger('Voucher');

  constructor(
    @InjectModel('Voucher') private model: PaginateModel<IVoucher>,
    private readonly userService: UserService,
    private readonly productPackageService: ProductPackageService,
    private readonly productService: ProductService,
    private readonly queueService: QueueService,
  ) {
    super(model);
  }

  async validateCode(code: string, id = null): Promise<boolean> {
    const existingCode: IVoucher = await this.model
      .findOne({ code, valid: true })
      .select('_id')
      .lean();

    if (existingCode && id && existingCode._id.toString() === id) {
      return true;
    }
    if (existingCode) {
      throw new BadRequestException('voucher code is already exists');
    }
    return true;
  }

  async validateBeforeCreate(
    code?: string,
    consumers?: string[],
    products?: string[],
    productPackages?: string[],
    id?: string,
  ): Promise<void> {
    if (code) {
      await this.validateCode(code, id);
    }

    if (consumers && consumers.length > 0) {
      await this.userService.isExists('_id', consumers, 'consumers');
    }
    if (products && products.length > 0) {
      await this.productService.isExists('_id', products, 'products');
    }
    if (productPackages && productPackages.length > 0) {
      await this.productPackageService.isExists(
        '_id',
        productPackages,
        'product packages',
      );
    }
  }

  generateConsumer(consumers: string[]): IVoucherConsumer[] {
    const consumerData: IVoucherConsumer[] = [];
    consumers.map(c => consumerData.push({ user: c }));
    return consumerData;
  }

  async saveImage(image: IFile, id: string): Promise<IVoucher> {
    const voucher = (await this.getById(id)) as IVoucher;
    const imageString = image.path.split('public')[1];
    const oldImage = 'public' + voucher.image;
    voucher.image = imageString;
    try {
      await Promise.all([
        voucher.save(),
        fs.promises.unlink(oldImage),
        this.queueService.resizeImage(image),
        Redis.deletePattern('Voucher'),
      ]);
    } catch (e) {
      Logger.debug(oldImage + ' not exists');
    }
    return voucher;
  }

  async validateBeforeUse(
    code: string,
    userId: string,
    products?: string[],
    packages?: string[],
  ): Promise<IVoucher | null> {
    const today = moment().startOf('day');
    const day = today.day().toString() as EDays;
    const hour = today.format('hh');

    // Find voucher by _id or code
    const options = {
      valid: true,
    };
    if (isMongoId(code)) {
      options['_id'] = code;
    } else {
      options['code'] = code;
    }
    const voucher = await this.model.findOne(options);
    if (!voucher) {
      this.logger.log('no voucher');

      return null;
    }
    // check if still valid
    if (!voucher.valid) {
      this.logger.log('voucher invalid');

      return null;
    }
    if (voucher.validFrom && voucher.validFrom > today.toDate()) {
      this.logger.log('voucher validFrom invalid');

      return null;
    }
    if (voucher.validUntil && voucher.validUntil < today.toDate()) {
      this.logger.log('voucher validUntil invalid');

      return null;
    }
    // check days in valid
    if (
      voucher.days &&
      voucher.days.length > 0 &&
      !voucher.days.includes(day)
    ) {
      this.logger.log('days invalid');

      return null;
    }
    // check hours is valid
    if (
      voucher.startHour &&
      voucher.endHour &&
      (voucher.startHour >= hour || voucher.endHour <= hour)
    ) {
      this.logger.log('hours invalid');

      return null;
    }
    // check if user privileged
    const voucherConsumers = voucher.consumers.map(c => c.user.toString());
    if (
      voucherConsumers &&
      voucherConsumers.length > 0 &&
      !voucherConsumers.includes(userId)
    ) {
      this.logger.log('voucherConsumers invalid');

      return null;
    }
    // check products privileged
    if (products && products.length > 0) {
      // const voucherProducts = voucher.products
    }
    // check product packages privileged
    return voucher;
  }

  @Cron('0 0 * * *')
  async handleCron(): Promise<void> {
    await this.invalidateVoucher();
  }

  async invalidateVoucher(): Promise<void> {
    const today = moment().startOf('day');
    await Promise.all([
      this.model.updateMany(
        {
          valid: true,
          validUntil: { $lte: today.toDate() },
        },
        { valid: false },
      ),
      Redis.deletePattern('Voucher'),
    ]);

    Logger.log('Vouchers invalidated', 'Cron');
  }
}
