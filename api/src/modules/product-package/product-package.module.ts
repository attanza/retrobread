import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from '../product/product.module';
import { ProductPackageController } from './product-package.controller';
import { ProductPackageSchema } from './product-package.schema';
import { ProductPackageService } from './product-package.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ProductPackage',
        schema: ProductPackageSchema,
        collection: 'product_packages',
      },
    ]),
    ProductModule,
  ],
  providers: [ProductPackageService],
  controllers: [ProductPackageController],
  exports: [ProductPackageService],
})
export class ProductPackageModule {}
