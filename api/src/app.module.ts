import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import 'dotenv/config';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { join } from 'path';
import { mongoosePagination } from 'ts-mongoose-pagination';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressModule } from './modules/address/address.module';
import { AuditMiddleware } from './modules/audit/audit.middleware';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoryModule } from './modules/category/category.module';
import { MockCourierModule } from './modules/mock-courier/mock-courier.module';
import { MockPaymentModule } from './modules/mock-payment/mock-payment.module';
import { NotificationModule } from './modules/notification/notification.module';
import { OrderModule } from './modules/order/order.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ProductPackageModule } from './modules/product-package/product-package.module';
import { ProductModule } from './modules/product/product.module';
import { ProfileModule } from './modules/profile/profile.module';
import { PromoModule } from './modules/promo/promo.module';
import { QueueModule } from './modules/queue/queue.module';
import { RoleModule } from './modules/role/role.module';
import { SeederService } from './modules/shared/services/seeder.service';
import { UserModule } from './modules/user/user.module';
import { VoucherModule } from './modules/voucher/voucher.module';
const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
const MONGO_DB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

@Module({
  imports: [
    MongooseModule.forRoot(`${DB_URL}/${DB_NAME}`, {
      ...MONGO_DB_OPTIONS,
      connectionFactory: connection => {
        connection.plugin(mongoosePagination);
        connection.plugin(mongooseAutopopulate);
        return connection;
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    RoleModule,
    PermissionModule,
    UserModule,
    ProfileModule,
    QueueModule,
    CategoryModule,
    ProductModule,
    AuditModule,
    NotificationModule,
    AddressModule,
    ProductModule,
    ProductPackageModule,
    VoucherModule,
    PromoModule,
    MockPaymentModule,
    MockCourierModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuditMiddleware)
      .exclude('/api/audits', '/api/audits/(.*)')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
