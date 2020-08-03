import { Permission } from '@/libs/permission.decorator';
import { PermissionGuard } from '@/libs/permission.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  apiCollection,
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '../helpers/responseParser';
import { EResources } from '../shared/enums/resource.enum';
import { IResourceCollection } from '../shared/interfaces/db-resource.interface';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notification.dto';
import { INotification, notificationFillable } from './notification.interface';
import { NotificationService } from './notification.service';

@Controller('/api/notifications')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  @Permission('read-notification')
  @UsePipes(ValidationPipe)
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<INotification>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Notification,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Notification, data);
  }

  @Get(':id')
  @Permission('read-notification')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<INotification>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Notification,
      cache: true,
      relations: 'permissions',
    });
    return apiItem(EResources.Notification, data);
  }

  @Post()
  @Permission('create-notification')
  @UsePipes(ValidationPipe)
  async create(
    @Body() createDto: CreateNotificationDto,
  ): Promise<IApiItem<INotification>> {
    const data = await this.service.create({
      createDto,
      resource: EResources.Notification,
      fillable: notificationFillable,
    });

    return apiCreated(EResources.Notification, data);
  }

  @Put(':id')
  @Permission('update-notification')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateNotificationDto,
  ): Promise<IApiItem<INotification>> {
    const data = await this.service.update({
      updateDto,
      id: param.id,
      resource: EResources.Notification,
      fillable: notificationFillable,
    });
    return apiUpdated(EResources.Notification, data);
  }

  @Delete(':id')
  @Permission('delete-notification')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<INotification>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.Notification });
    return apiDeleted(EResources.Notification);
  }
}
