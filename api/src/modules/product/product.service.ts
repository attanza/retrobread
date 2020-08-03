import MqttHandler from '@/libs/mqttHandler';
import { Redis } from '@/libs/redis';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { PaginateModel } from 'mongoose';
import { OrderProductDto } from '../order/order.dto';
import { QueueService } from '../queue/queue.service';
import { EResources } from '../shared/enums/resource.enum';
import { IFile } from '../shared/interfaces/multer.interface';
import { BaseDbService } from '../shared/services/base-db.service';
import { EVoucherType, IVoucher } from '../voucher/voucher.interface';
import { UploadProductImageDto } from './product.dto';
import { IProduct, IProductImage } from './product.interface';

@Injectable()
export class ProductService extends BaseDbService<IProduct> {
  constructor(
    @InjectModel('Product') private model: PaginateModel<IProduct>,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {
    super(model);
  }

  async saveImage(
    image: IFile,
    uploadImageDto: UploadProductImageDto,
    productId: string,
    fillable: string[],
  ): Promise<IProduct> {
    const updateData: Partial<UploadProductImageDto> = {};
    fillable.map(key => {
      if (uploadImageDto[key]) {
        updateData[key] = uploadImageDto[key];
      }
    });
    const product: IProduct = await this.getById(productId);
    const imageString = image.path.split('public')[1];
    product.images.push({ ...updateData, url: imageString });
    const topic = `${process.env.DB_NAME}/update/${EResources.Product}`;
    try {
      await Promise.all([
        product.save(),
        this.queueService.resizeImage(image),
        Redis.deletePattern(EResources.Product),
        MqttHandler.sendMessage(topic, JSON.stringify(product)),
      ]);
    } catch (e) {
      Logger.debug(JSON.stringify(e), 'product image upload error');
    }
    return product;
  }

  async updateImageDetail(
    uploadImageDto: UploadProductImageDto,
    productId: string,
    imageId: string,
    fillable: string[],
  ): Promise<IProduct | null> {
    const updateData: Partial<UploadProductImageDto> = {};
    fillable.map(key => {
      if (uploadImageDto[key]) {
        updateData[key] = uploadImageDto[key];
      }
    });
    if (Object.keys(updateData).length === 0) {
      return null;
    }
    const product: IProduct = await this.getById(productId);
    const images = [...product.toJSON().images];
    const idx = images.findIndex(i => i._id.toString() === imageId);
    if (idx === -1) {
      throw new BadRequestException('Product image not found');
    }
    const newImageDetail = { ...images[idx], ...updateData };
    product.images.splice(idx, 1, newImageDetail);
    const topic = `${process.env.DB_NAME}/update/${EResources.Product}`;
    await Promise.all([
      product.save(),
      Redis.deletePattern(EResources.Product),
      MqttHandler.sendMessage(topic, JSON.stringify(product)),
    ]);
    return product;
  }

  async deleteProductImage(
    productId: string,
    imageId: string,
  ): Promise<IProduct | null> {
    const product: IProduct = await this.getById(productId);
    const images: IProductImage[] = [...product.images];
    const idx = images.findIndex(i => i._id.toString() === imageId);
    if (idx === -1) {
      throw new BadRequestException('Product image not found');
    }
    const oldImage = 'public/products' + images[idx].url.split('/products')[1];
    product.images.splice(idx, 1);
    const topic = `${process.env.DB_NAME}/update/${EResources.Product}`;

    try {
      await Promise.all([
        product.save(),
        fs.promises.unlink(oldImage),
        Redis.deletePattern(EResources.Product),
        MqttHandler.sendMessage(topic, JSON.stringify(product)),
      ]);
    } catch (error) {
      Logger.log(JSON.stringify(error), 'Delete product image error');
    }
    return product;
  }

  async deleteProduct(productId: string): Promise<IProduct> {
    const product: IProduct = await this.getById(productId);
    const images: IProductImage[] = [...product.toJSON().images];

    const topic = `${process.env.DB_NAME}/delete/${EResources.Product}`;
    try {
      await Promise.all(
        images.map(image => {
          const url = 'public/products' + image.url.split('/products')[1];
          fs.promises.unlink(url);
        }),
      );
      await Promise.all([
        this.model.deleteOne({ _id: productId }),
        Redis.deletePattern(EResources.Product),
        MqttHandler.sendMessage(topic, JSON.stringify(product)),
      ]);
    } catch (error) {
      Logger.log(JSON.stringify(error), 'Delete product error');
    }
    return product;
  }

  async sumProductsPrice(
    orderProductDto: OrderProductDto[],
    voucher: IVoucher,
  ): Promise<number> {
    // get products from database where _id in ids
    const ids = orderProductDto.map(opd => opd.id);
    const products = await this.model.find({ _id: { $in: ids } });

    let productPrice = 0;
    products.map(product => {
      let price = product.price; // initiate price with actual product price
      let qty = 1;
      const qtyIdx = orderProductDto.findIndex(opd => opd.id === product._id);
      if (qtyIdx !== -1) {
        qty = orderProductDto[qtyIdx].qty;
      }

      // if product is in the voucher product list
      // NOTE: voucher value is in string format, need to cast it in Number
      if (
        voucher &&
        voucher.products &&
        voucher.products.length > 0 &&
        voucher.products.includes(product._id)
      ) {
        let reducedPrice = 0;

        // reduce by amount
        if (voucher.voucherType === EVoucherType.amount) {
          reducedPrice = productPrice - Number(voucher.voucherValue);
        }

        // reduce by percentage
        if (voucher.voucherType === EVoucherType.percentage) {
          reducedPrice =
            product.price -
            product.price * (Number(voucher.voucherValue) * 100);
        }

        // if reducedPrice happens to be smaller than 0 than make it 0
        if (reducedPrice < 0) {
          reducedPrice = 0;
        }
        price = reducedPrice;
      }

      // if product already has discount price than abort voucher and use discount price instead
      if (product.discountPrice) {
        price = product.discountPrice;
      }
      productPrice += price * qty; // sum up prices
    });
    return productPrice;
  }
}
