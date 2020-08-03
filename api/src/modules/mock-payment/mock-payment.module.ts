import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { MockPaymentUtilController } from './controllers/mock-payment-util.controller';
import { MockPaymentController } from './controllers/mock-payment.controller';
import { MockPaymentSchema } from './mock-payment.schema';
import { MockPaymentService } from './mock-payment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'MockPayment',
        schema: MockPaymentSchema,
      },
    ]),
    UserModule,
  ],
  providers: [MockPaymentService],
  controllers: [MockPaymentController, MockPaymentUtilController],
  exports: [MockPaymentService],
})
export class MockPaymentModule {}
