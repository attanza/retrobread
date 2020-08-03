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
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { IUser, userFillable } from './user.interface';
import { UserService } from './user.service';

@Controller('/api/users')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class UserController {
  private readonly uniques = ['email', 'phone'];
  constructor(private readonly service: UserService) {}

  @Get()
  @Permission('read-user')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IUser>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.User,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.User, data);
  }

  @Get(':id')
  @Permission('read-user')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IUser>> {
    const data = await this.service.getById(param.id);
    return apiItem(EResources.User, data);
  }

  @Post()
  @Permission('read-user')
  async create(@Body() createDto: CreateUserDto): Promise<IApiItem<IUser>> {
    await this.service.roleExists(createDto.role);
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.User,
      fillable: userFillable,
    });

    return apiCreated(EResources.User, data);
  }

  @Put(':id')
  @Permission('read-user')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateUserDto,
  ): Promise<IApiItem<IUser>> {
    if (updateDto.role) {
      await this.service.roleExists(updateDto.role);
    }
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.User,
      fillable: userFillable,
    });
    return apiUpdated(EResources.User, data);
  }

  @Delete(':id')
  @Permission('read-user')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IUser>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.User });
    return apiDeleted(EResources.User);
  }
}
