import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductPackageModule } from '../product-package/product-package.module';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { VoucherUtilController } from './controllers/voucher-util.controller';
import { VoucherController } from './controllers/voucher.controller';
import { VoucherSchema } from './voucher.schema';
import { VoucherService } from './voucher.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Voucher',
        schema: VoucherSchema,
      },
    ]),
    UserModule,
    ProductModule,
    ProductPackageModule,
  ],
  controllers: [VoucherController, VoucherUtilController],
  providers: [VoucherService],
  exports: [VoucherService],
})
export class VoucherModule {}
