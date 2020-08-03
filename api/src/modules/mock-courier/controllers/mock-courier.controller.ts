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
import {
  CreateMockCourierDto,
  UpdateMockCourierDto,
} from '../mock-courier.dto';
import { IMockCourier, mockCourierFillable } from '../mock-courier.interface';
import { MockCourierService } from '../mock-courier.service';

@Controller('/api/mock-couriers')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MockCourierController {
  private readonly uniques = ['provider'];
  constructor(private readonly service: MockCourierService) {}

  @Get()
  // @Permission('read-mock-courier')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IMockCourier>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.MockCourier,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.MockCourier, data);
  }

  @Get(':id')
  // @Permission('read-mock-courier')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IMockCourier>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.MockCourier,
      cache: true,
      relations: 'permissions',
    });
    return apiItem(EResources.MockCourier, data);
  }

  @Post()
  @Permission('create-mock-courier')
  async create(
    @Body() createDto: CreateMockCourierDto,
  ): Promise<IApiItem<IMockCourier>> {
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.MockCourier,
      fillable: mockCourierFillable,
    });

    return apiCreated(EResources.MockCourier, data);
  }

  @Put(':id')
  @Permission('update-mock-courier')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateMockCourierDto,
  ): Promise<IApiItem<IMockCourier>> {
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.MockCourier,
      fillable: mockCourierFillable,
    });
    return apiUpdated(EResources.MockCourier, data);
  }

  @Delete(':id')
  @Permission('delete-mock-courier')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IMockCourier>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.MockCourier });
    return apiDeleted(EResources.MockCourier);
  }
}
