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
import { CreatePermissionDto, UpdatePermissionDto } from './permission.dto';
import { IPermission, permissionFillable } from './permission.interface';
import { PermissionService } from './permission.service';

@Controller('/api/permissions')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PermissionController {
  private readonly uniques = ['name'];
  constructor(private readonly service: PermissionService) {}

  @Get()
  @Permission('read-permission')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IPermission>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Permission,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Permission, data);
  }

  @Get(':id')
  @Permission('read-permission')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IPermission>> {
    const data = await this.service.getById(param.id);
    return apiItem(EResources.Permission, data);
  }

  @Post()
  @Permission('read-permission')
  async create(
    @Body() createDto: CreatePermissionDto,
  ): Promise<IApiItem<IPermission>> {
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.Permission,
      fillable: permissionFillable,
    });

    return apiCreated(EResources.Permission, data);
  }

  @Put(':id')
  @Permission('read-permission')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<IApiItem<IPermission>> {
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.Permission,
      fillable: permissionFillable,
    });
    return apiUpdated(EResources.Permission, data);
  }

  @Delete(':id')
  @Permission('read-permission')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IPermission>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.Permission });
    return apiDeleted(EResources.Permission);
  }
}
