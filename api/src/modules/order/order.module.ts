import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AddressModule } from '../address/address.module';
import { MockCourierModule } from '../mock-courier/mock-courier.module';
import { MockPaymentModule } from '../mock-payment/mock-payment.module';
import { ProductPackageModule } from '../product-package/product-package.module';
import { ProductModule } from '../product/product.module';
import { VoucherModule } from '../voucher/voucher.module';
import { OrderController } from './order.controller';
import { OrderSchema } from './order.schema';
import { OrderService } from './order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Order',
        schema: OrderSchema,
      },
    ]),
    ProductModule,
    ProductPackageModule,
    VoucherModule,
    MockCourierModule,
    MockPaymentModule,
    AddressModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
