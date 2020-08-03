import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { IFile } from '../shared/interfaces/multer.interface';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('resizeImage') private resizeImageQueue: Queue,
    @InjectQueue('unlinkImages') private unlinkImagesQueue: Queue,
  ) {}

  async resizeImage(image: IFile): Promise<void> {
    this.resizeImageQueue.add(
      'resizeImage',
      { image },
      {
        attempts: 3,
        removeOnComplete: true,
      },
    );
  }
  async unlinkImages(images: IFile[]): Promise<void> {
    this.unlinkImagesQueue.add(
      'resizeImages',
      { images },
      {
        attempts: 3,
        removeOnComplete: true,
      },
    );
  }
}
