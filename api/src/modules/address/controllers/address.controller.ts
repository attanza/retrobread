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
} from '../../helpers/responseParser';
import { EResources } from '../../shared/enums/resource.enum';
import { IResourceCollection } from '../../shared/interfaces/db-resource.interface';
import {
  IApiCollection,
  IApiItem,
} from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../../shared/pipes/resource-pagination.pipe';
import { UserService } from '../../user/user.service';
import { CreateAddressDto, UpdateAddressDto } from '../address.dto';
import { addressFillable, IAddress } from '../address.interface';
import { AddressService } from '../address.service';

@Controller('/api/addresses')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class AddressController {
  constructor(
    private readonly service: AddressService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @Permission('read-address')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IAddress>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Address,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Address, data);
  }

  @Get(':id')
  @Permission('read-address')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IAddress>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Address,
      cache: true,
      relations: 'users',
    });
    return apiItem(EResources.Address, data);
  }

  @Post()
  @Permission('create-address')
  async create(
    @Body() createDto: CreateAddressDto,
  ): Promise<IApiItem<IAddress>> {
    await this.userService.isExists('_id', [createDto.user], 'user');
    const data = await this.service.create({
      createDto,
      resource: EResources.Address,
      fillable: addressFillable,
    });

    return apiCreated(EResources.Address, data);
  }

  @Put(':id')
  @Permission('update-address')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateAddressDto,
  ): Promise<IApiItem<IAddress>> {
    if (updateDto.user) {
      await this.userService.isExists('_id', [updateDto.user], 'user');
    }
    const data = await this.service.update({
      updateDto,
      id: param.id,
      resource: EResources.Address,
      fillable: addressFillable,
    });
    return apiUpdated(EResources.Address, data);
  }

  @Delete(':id')
  @Permission('delete-address')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IAddress>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.Address });
    return apiDeleted(EResources.Address);
  }
}
