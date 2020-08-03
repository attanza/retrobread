import { Permission } from '@/libs/permission.decorator';
import { PermissionGuard } from '@/libs/permission.guard';
import { Role } from '@/libs/role.decorator';
import { RoleGuard } from '@/libs/role.guard';
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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  apiCollection,
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '../helpers/responseParser';
import { IRole } from '../role/role.interface';
import { EResources } from '../shared/enums/resource.enum';
import { IResourceCollection } from '../shared/interfaces/db-resource.interface';
import { IRequest } from '../shared/interfaces/express.interface';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { CreateOrderDto, UpdateOrderDto } from './order.dto';
import { IOrder, orderFillable } from './order.interface';
import { OrderService } from './order.service';

@Controller('/api/orders')
@UseGuards(AuthGuard('jwt'), PermissionGuard, RoleGuard)
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Get()
  async getAll(
    @Query() query: ResourcePaginationPipe,
    @Req() req: IRequest,
  ): Promise<IApiCollection<IOrder>> {
    const role = req.user.role as IRole;
    if (role.slug === 'user') {
      (query.fieldKey = 'user'), (query.fieldValue = req.user._id);
    }
    const ctx: IResourceCollection = {
      query,
      cache: false,
      resource: EResources.Order,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Order, data);
  }

  @Get(':id')
  async show(
    @Param() param: MongoIdPipe,
    @Req() req: IRequest,
  ): Promise<IApiItem<IOrder>> {
    const options = { _id: param.id, user: req.user._id };
    const data = await this.service.showOneWithOptions(
      options,
      EResources.Address,
      false,
    );
    return apiItem(EResources.Order, data);
  }

  @Post()
  @Role('user')
  async create(
    @Body() createDto: CreateOrderDto,
    @Req() req: IRequest,
  ): Promise<IApiItem<IOrder>> {
    const data = await this.service.createOrder(createDto, req.user._id);
    return apiCreated(EResources.Order, data);
  }

  @Put(':id')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateOrderDto,
  ): Promise<IApiItem<IOrder>> {
    const data = await this.service.update({
      updateDto,
      id: param.id,
      resource: EResources.Order,
      fillable: orderFillable,
    });
    return apiUpdated(EResources.Order, data);
  }

  @Delete(':id')
  @Permission('delete-order')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IOrder>> {
    const { id } = param;
    await this.service.destroy({
      id,
      resource: EResources.Order,
      imageKey: 'image',
    });
    return apiDeleted(EResources.Order);
  }
}
