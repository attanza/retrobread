import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyNotificationController } from './my-notification.controller';
import { NotificationController } from './notification.controller';
import { NotificationSchema } from './notification.schema';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Notification',
        schema: NotificationSchema,
      },
    ]),
  ],
  controllers: [NotificationController, MyNotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
