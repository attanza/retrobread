import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import uniqid from 'uniqid';
import { AddressService } from '../address/address.service';
import { GetDistancePrice } from '../mock-courier/mock-courier.dto';
import { MockCourierService } from '../mock-courier/mock-courier.service';
import { MockPaymentService } from '../mock-payment/mock-payment.service';
import { ProductPackageService } from '../product-package/product-package.service';
import { ProductService } from '../product/product.service';
import { BaseDbService } from '../shared/services/base-db.service';
import { IVoucher } from '../voucher/voucher.interface';
import { VoucherService } from '../voucher/voucher.service';
import { CreateOrderDto } from './order.dto';
import { EOrderStatus, IOrder } from './order.interface';
@Injectable()
export class OrderService extends BaseDbService<IOrder> {
  private logger = new Logger('Order');
  constructor(
    @InjectModel('Order') private model: PaginateModel<IOrder>,
    private readonly productService: ProductService,
    private readonly productPackageService: ProductPackageService,
    private readonly voucherService: VoucherService,
    private readonly mockCourierService: MockCourierService,
    private readonly mockPaymentService: MockPaymentService,
    private readonly addressService: AddressService,
  ) {
    super(model);
  }

  async createOrder(
    createDto: CreateOrderDto,
    userId: string,
  ): Promise<IOrder> {
    // IDEA: create shop list and detect delivery from nearest shop
    // validate voucher entities
    await this.validateOrderEntities(createDto, userId);

    // get address
    const address = await this.addressService.getOneWithOptions({
      _id: createDto.address,
      user: userId,
    });
    this.logger.log(JSON.stringify(address), 'address');

    // get voucher
    let voucher: IVoucher;
    if (createDto.voucher) {
      voucher = await this.voucherService.validateBeforeUse(
        createDto.voucher,
        userId,
      );
    }
    this.logger.log(JSON.stringify(voucher), 'voucher');

    // calculate order
    const productPrice = await this.productService.sumProductsPrice(
      createDto.products,
      voucher,
    );
    this.logger.log(JSON.stringify(productPrice), 'productPrice');

    const distanceData: GetDistancePrice = {
      lat1: -6.917464, // shop latitude hardcoded for temporary, later use setting instead
      lng1: 107.619125, // shop longitude hardcoded for temporary, later use setting instead
      lat2: address.latitude,
      lng2: address.longitude,
      providerId: createDto.courier,
    };
    const deliveryPrice = await this.mockCourierService.getDistancePrice(
      distanceData,
    );
    this.logger.log(JSON.stringify(deliveryPrice), 'deliveryPrice');

    const subTotal = productPrice + deliveryPrice;
    this.logger.log(JSON.stringify(subTotal), 'subTotal');

    const tax = subTotal * 0.1; // 10%
    this.logger.log(JSON.stringify(tax), 'tax');

    const total = subTotal + tax;
    this.logger.log(JSON.stringify(total), 'total');

    // check if balance is enough
    const balance = await this.mockPaymentService.getBalance(createDto.payWith);
    this.logger.log(JSON.stringify(balance), 'balance');

    if (balance <= total) {
      throw new BadRequestException('balance is not sufficient');
    }
    const orderId = uniqid.time();
    const productIds = createDto.products.map(p => p.id);
    const orderData = {
      orderId,
      products: productIds,
      packages: createDto.packages,
      user: userId,
      address: address._id,
      status: EOrderStatus.new,
      amount: total,
      voucher: voucher ? voucher._id : undefined,
      courier: createDto.courier,
      payWith: createDto.payWith,
      histories: [],
    };
    const newOrder = new this.model();
    Object.keys(orderData).map(key => (newOrder[key] = orderData[key]));
    await newOrder.save();

    // reduce balance
    // await this.mockPaymentService.reduceBalance(
    //   createDto.payWith,
    //   userId,
    //   total,
    // );
    // TODO: notifications
    return newOrder;
  }

  async validateOrderEntities(
    createDto: CreateOrderDto,
    userId: string,
  ): Promise<void> {
    // Check if products is exist
    if (createDto.products && createDto.products.length > 0) {
      const productIds = createDto.products.map(product => product.id);
      await this.productService.isExists('_id', productIds, 'products');
    }
    // Check Product Packages is Exists
    if (createDto.packages && createDto.packages.length > 0) {
      await this.productPackageService.isExists(
        '_id',
        createDto.packages,
        'packages',
      );
    }

    // Check Product Address is Exists
    await this.addressService.isExists('_id', [createDto.address], 'address');

    // check if courier is valid
    await this.mockCourierService.isExists(
      '_id',
      [createDto.courier],
      'courier',
    );
    // check if payment is valid
    const mockPaymentServiceOptions = {
      'consumers.user': userId,
    };
    await this.mockPaymentService.getOneWithOptions(mockPaymentServiceOptions);
  }
}
