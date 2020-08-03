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
import {
  CreateMockPaymentDto,
  UpdateMockPaymentDto,
} from '../mock-payment.dto';
import { IMockPayment, mockPaymentFillable } from '../mock-payment.interface';
import { MockPaymentService } from '../mock-payment.service';

@Controller('/api/mock-payments')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MockPaymentController {
  private readonly uniques = ['provider'];
  constructor(
    private readonly service: MockPaymentService,
    private readonly userService: UserService,
  ) {}

  @Get()
  @UsePipes(ValidationPipe)
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IMockPayment>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.MockPayment,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.MockPayment, data);
  }

  @Get(':id')
  // @Permission('read-mock-payment')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IMockPayment>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.MockPayment,
      cache: true,
      relations: 'permissions',
    });
    return apiItem(EResources.MockPayment, data);
  }

  @Post()
  @Permission('create-mock-payment')
  @UsePipes(ValidationPipe)
  async create(
    @Body() createDto: CreateMockPaymentDto,
  ): Promise<IApiItem<IMockPayment>> {
    if (createDto.consumers && createDto.consumers.length > 0) {
      const consumerUsers = createDto.consumers.map(c => c.user);
      await this.userService.isExists('_id', consumerUsers, 'users');
    }
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.MockPayment,
      fillable: mockPaymentFillable,
    });

    return apiCreated(EResources.MockPayment, data);
  }

  @Put(':id')
  // @Permission('update-mock-payment')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateMockPaymentDto,
  ): Promise<IApiItem<IMockPayment>> {
    if (updateDto.consumers && updateDto.consumers.length > 0) {
      const consumerUsers = updateDto.consumers.map(c => c.user);
      await this.userService.isExists('_id', consumerUsers, 'users');
    }
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.MockPayment,
      fillable: mockPaymentFillable,
    });
    return apiUpdated(EResources.MockPayment, data);
  }

  @Delete(':id')
  @Permission('delete-mock-payment')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IMockPayment>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.MockPayment });
    return apiDeleted(EResources.MockPayment);
  }
}
