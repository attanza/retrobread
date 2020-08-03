import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { ResizeImageProcessor } from './resize-image.processor';
import { UnlinkImagesProcessor } from './unlink-images.processor';

const REDIS_CONN = {
  host: process.env.REDIS_URL,
  port: 6379,
};

@Global()
@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'resizeImage',
        redis: REDIS_CONN,
      },
      {
        name: 'unlinkImages',
        redis: REDIS_CONN,
      },
    ),
  ],
  providers: [QueueService, ResizeImageProcessor, UnlinkImagesProcessor],
  exports: [QueueService],
})
export class QueueModule {}
