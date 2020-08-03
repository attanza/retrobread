import { PermissionGuard } from '@/libs/permission.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isIn } from 'class-validator';
import {
  apiCollection,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '../helpers/responseParser';
import { EResources } from '../shared/enums/resource.enum';
import { IResourceCollection } from '../shared/interfaces/db-resource.interface';
import { IRequest } from '../shared/interfaces/express.interface';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { NotificationIdsDto } from './notification.dto';
import { ENotificationAction, INotification } from './notification.interface';
import { NotificationService } from './notification.service';
@Controller('/api/my-notifications')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MyNotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  async getAll(
    @Req() req: IRequest,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<INotification>> {
    query.fieldKey = 'user';
    query.fieldValue = req.user._id;
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Notification,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Notification, data);
  }

  @Get(':id')
  async show(
    @Req() req: IRequest,
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem<INotification>> {
    const data = await this.service.getMyNotificationById(
      param.id,
      req.user._id,
    );
    return apiItem(EResources.Notification, data);
  }

  @Put(':action')
  async update(
    @Param('action') action: ENotificationAction,
    @Body() postData: NotificationIdsDto,
    @Req() req: IRequest,
  ): Promise<IApiItem<INotification>> {
    if (!isIn(action, [ENotificationAction.READ, ENotificationAction.UNREAD])) {
      throw new BadRequestException(
        `action should be in ${ENotificationAction.READ}, ${ENotificationAction.UNREAD}`,
      );
    }
    await this.service.updateMyNotification(postData.ids, req.user._id, action);
    return apiUpdated(EResources.Notification, null);
  }

  @Delete()
  @UsePipes(ValidationPipe)
  async destroy(
    @Req() req: IRequest,
    @Body() deleteData: NotificationIdsDto,
  ): Promise<IApiItem<INotification>> {
    await this.service.deleteMyNotifications(deleteData.ids, req.user._id);
    return apiDeleted(EResources.Notification);
  }
}
