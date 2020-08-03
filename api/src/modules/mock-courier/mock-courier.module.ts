import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MockCourierUtilController } from './controllers/mock-courier-util.controller';
import { MockCourierController } from './controllers/mock-courier.controller';
import { MockCourierSchema } from './mock-courier.schema';
import { MockCourierService } from './mock-courier.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'MockCourier',
        schema: MockCourierSchema,
      },
    ]),
  ],
  controllers: [MockCourierController, MockCourierUtilController],
  providers: [MockCourierService],
  exports: [MockCourierService],
})
export class MockCourierModule {}
