import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { apiItem, apiUpdated } from '../helpers/responseParser';
import { IRequest } from '../shared/interfaces/express.interface';
import { IFile } from '../shared/interfaces/multer.interface';
import { IApiItem } from '../shared/interfaces/response-parser.interface';
import { IUser, userFillable } from '../user/user.interface';
import { UserService } from '../user/user.service';
import avatarInterceptor from './avatar.interceptor';
import { ChangePasswordDto, UpdateProfileDto } from './profile.dto';
import { ProfileService } from './profile.service';

@Controller('/api/profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}
  @Get()
  async profile(@Req() req: IRequest): Promise<IApiItem<IUser>> {
    return apiItem('Profile', req.user);
  }

  @Put()
  async update(
    @Req() req: IRequest,
    @Body() updateDto: UpdateProfileDto,
  ): Promise<IApiItem<IUser>> {
    await this.userService.update({
      updateDto,
      uniques: ['email', 'phone'],
      id: req.user._id,
      resource: `Authorized_${req.user._id}`,
      fillable: userFillable,
    });
    const data = await this.userService.getByIdWithRolePermissions(
      req.user._id,
    );
    return apiUpdated('Profile', data);
  }

  @Post('change-password')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Req() req: IRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<IApiItem<IUser>> {
    await this.profileService.changePassword(req.user._id, changePasswordDto);
    return apiUpdated('Password', null);
  }

  @Post('avatar')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('avatar', avatarInterceptor))
  async uploadFile(
    @Req() req: IRequest,
    @UploadedFile() avatar: IFile,
  ): Promise<IApiItem<IUser>> {
    if (!avatar) {
      throw new BadRequestException(
        'Avatar should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }
    const updated = await this.profileService.saveAvatar(avatar, req.user._id);
    return apiItem('User', updated);
  }
}
