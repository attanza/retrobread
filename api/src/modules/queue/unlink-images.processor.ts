import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import fs from 'fs';
@Processor('unlinkImages')
export class UnlinkImagesProcessor {
  private readonly logger = new Logger(UnlinkImagesProcessor.name);

  @Process('unlinkImages')
  async handleSaveAudit(job: Job): Promise<void> {
    this.logger.debug('handleUnlinkImages starts at ' + new Date());
    const { images } = job.data;
    await Promise.all(images.map(image => fs.promises.unlink(image)));
    this.logger.debug('handleUnlinkImages finish at ' + new Date());
  }
}
