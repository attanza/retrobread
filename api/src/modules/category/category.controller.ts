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
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';
import { categoryFillable, ICategory } from './category.interface';
import { CategoryService } from './category.service';

@Controller('/api/categories')
export class CategoryController {
  private readonly uniques = ['name'];
  constructor(private readonly service: CategoryService) {}

  @Get()
  @UsePipes(ValidationPipe)
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<ICategory>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Category,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Category, data);
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<ICategory>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Category,
      cache: true,
    });
    return apiItem(EResources.Category, data);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('create-category')
  @UsePipes(ValidationPipe)
  async create(
    @Body() createDto: CreateCategoryDto,
  ): Promise<IApiItem<ICategory>> {
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.Category,
      fillable: categoryFillable,
    });

    return apiCreated(EResources.Category, data);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('update-category')
  @UsePipes(ValidationPipe)
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateCategoryDto,
  ): Promise<IApiItem<ICategory>> {
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.Category,
      fillable: categoryFillable,
    });
    return apiUpdated(EResources.Category, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('delete-category')
  @UsePipes(ValidationPipe)
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<ICategory>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.Category });
    return apiDeleted(EResources.Category);
  }
}
