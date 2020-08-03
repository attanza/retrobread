import resizeImage from '@/modules/helpers/resizeImage';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('resizeImage')
export class ResizeImageProcessor {
  private readonly logger = new Logger(ResizeImageProcessor.name);

  @Process('resizeImage')
  async handleResizeImage(job: Job): Promise<void> {
    this.logger.debug('handleResizeImage starts at ' + new Date());
    const { image } = job.data;
    await resizeImage([image.path], 400);
    this.logger.debug('handleResizeImage finish at ' + new Date());
  }
}
