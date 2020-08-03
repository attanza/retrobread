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
  Req,
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
} from '../../helpers/responseParser';
import { EResources } from '../../shared/enums/resource.enum';
import { IResourceCollection } from '../../shared/interfaces/db-resource.interface';
import { IRequest } from '../../shared/interfaces/express.interface';
import {
  IApiCollection,
  IApiItem,
} from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../../shared/pipes/resource-pagination.pipe';
import { CreateAddressDto, UpdateAddressDto } from '../address.dto';
import { addressFillable, IAddress } from '../address.interface';
import { AddressService } from '../address.service';

@Controller('/api/my-addresses')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MyAddressController {
  constructor(private readonly service: AddressService) {}

  @Get()
  @UsePipes(ValidationPipe)
  async getAll(
    @Req() req: IRequest,
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IAddress>> {
    query.fieldKey = 'user';
    query.fieldValue = req.user._id;
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Address,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Address, data);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(
    @Req() req: IRequest,
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem<IAddress>> {
    const options = { _id: param.id, user: req.user._id };
    const data = await this.service.showOneWithOptions(
      options,
      EResources.Address,
    );
    return apiItem(EResources.Address, data);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() createDto: CreateAddressDto,
    @Req() req: IRequest,
  ): Promise<IApiItem<IAddress>> {
    createDto.user = req.user._id;
    const data = await this.service.create({
      createDto,
      resource: EResources.Address,
      fillable: addressFillable,
    });

    return apiCreated(EResources.Address, data);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateAddressDto,
    @Req() req: IRequest,
  ): Promise<IApiItem<IAddress>> {
    const options = { _id: param.id, user: req.user._id };

    const data = await this.service.update({
      updateDto,
      id: param.id,
      resource: EResources.Address,
      fillable: addressFillable,
      dbOptions: options,
    });
    return apiUpdated(EResources.Address, data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  async destroy(
    @Req() req: IRequest,

    @Param() param: MongoIdPipe,
  ): Promise<IApiItem<IAddress>> {
    const { id } = param;
    const options = { _id: param.id, user: req.user._id };

    await this.service.destroy({
      id,
      resource: EResources.Address,
      dbOptions: options,
    });
    return apiDeleted(EResources.Address);
  }
}
