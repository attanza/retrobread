import { Redis } from '@/libs/redis';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { compare } from 'bcryptjs';
import * as fs from 'fs';
import { QueueService } from '../queue/queue.service';
import { IFile } from '../shared/interfaces/multer.interface';
import { IUser } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { ChangePasswordDto } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userService: UserService,
    private readonly queueService: QueueService,
  ) {}

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<string> {
    const { oldPassword, password } = changePasswordDto;
    const user = await this.userService.findById(userId);
    const isMatched = await compare(oldPassword, user.password);
    if (!isMatched) {
      throw new BadRequestException('Old password incorrect');
    }
    user.password = password;
    Promise.all([user.save(), Redis.del(`Authorized_${user._id}`)]);

    return 'Password successfully updated';
  }

  async saveAvatar(avatar: IFile, userId: string): Promise<IUser> {
    const user: IUser = await this.userService.findById(userId);
    const imageString = avatar.path.split('public')[1];
    const oldAvatar = 'public' + user.avatar;
    user.avatar = imageString;
    try {
      await Promise.all([
        user.save(),
        fs.promises.unlink(oldAvatar),
        this.queueService.resizeImage(avatar),
        Redis.deletePattern(`Authorized_${userId}`),
      ]);
    } catch (e) {
      Logger.debug(oldAvatar + ' not exists');
    }
    return user;
  }
}
