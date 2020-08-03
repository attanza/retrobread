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
import { PermissionService } from '../permission/permission.service';
import { EResources } from '../shared/enums/resource.enum';
import { IResourceCollection } from '../shared/interfaces/db-resource.interface';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { IRole, roleFillable } from './role.interface';
import { RoleService } from './role.service';

@Controller('/api/roles')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class RoleController {
  private readonly uniques = ['name'];
  constructor(
    private readonly service: RoleService,
    private readonly permissionService: PermissionService,
  ) {}

  @Get()
  @Permission('read-role')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IRole>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Role,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Role, data);
  }

  @Get(':id')
  @Permission('read-role')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IRole>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Role,
      cache: true,
      relations: 'permissions',
    });
    return apiItem(EResources.Role, data);
  }

  @Post()
  @Permission('create-role')
  async create(@Body() createDto: CreateRoleDto): Promise<IApiItem<IRole>> {
    if (createDto.permissions) {
      await this.permissionService.isExists(
        '_id',
        createDto.permissions,
        'permissions',
      );
    }
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.Role,
      fillable: roleFillable,
    });

    return apiCreated(EResources.Role, data);
  }

  @Put(':id')
  @Permission('update-role')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateRoleDto,
  ): Promise<IApiItem<IRole>> {
    if (updateDto.permissions) {
      await this.permissionService.isExists(
        '_id',
        updateDto.permissions,
        'permissions',
      );
    }
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.Role,
      fillable: roleFillable,
    });
    return apiUpdated(EResources.Role, data);
  }

  @Delete(':id')
  @Permission('delete-role')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IRole>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.Role });
    return apiDeleted(EResources.Role);
  }
}
