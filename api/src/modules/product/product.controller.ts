import { Permission } from '@/libs/permission.decorator';
import { PermissionGuard } from '@/libs/permission.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from '../category/category.service';
import {
  apiCollection,
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '../helpers/responseParser';
import { EResources } from '../shared/enums/resource.enum';
import { IResourceCollection } from '../shared/interfaces/db-resource.interface';
import { IFile } from '../shared/interfaces/multer.interface';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import {
  CreateProductDto,
  UpdateProductDto,
  UploadProductImageDto,
} from './product.dto';
import productInterceptor from './product.interceptor';
import {
  IProduct,
  productFillable,
  productImageFillable,
} from './product.interface';
import { ProductService } from './product.service';

@Controller('/api/products')
export class ProductController {
  private readonly uniques = ['name'];
  constructor(
    private readonly service: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IProduct>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Product,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Product, data);
  }

  @Get(':id')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IProduct>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Product,
      cache: true,
    });
    return apiItem(EResources.Product, data);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('create-product')
  async create(
    @Body() createDto: CreateProductDto,
  ): Promise<IApiItem<IProduct>> {
    if (createDto.categories) {
      await this.categoryService.isExists(
        '_id',
        createDto.categories,
        'categories',
      );
    }
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.Product,
      fillable: productFillable,
    });

    return apiCreated(EResources.Product, data);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('update-product')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateProductDto,
  ): Promise<IApiItem<IProduct>> {
    if (updateDto.categories) {
      await this.categoryService.isExists(
        '_id',
        updateDto.categories,
        'categories',
      );
    }
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.Product,
      fillable: productFillable,
    });
    return apiUpdated(EResources.Product, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('delete-product')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IProduct>> {
    const { id } = param;
    await this.service.deleteProduct(id);
    return apiDeleted(EResources.Product);
  }

  @Post('/:id/image')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('update-product')
  @UseInterceptors(FileInterceptor('image', productInterceptor))
  async addImage(
    @Param() param: MongoIdPipe,
    @Body() uploadImageDto: UploadProductImageDto,
    @UploadedFile() image: IFile,
  ): Promise<IApiItem<IProduct>> {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }
    const data = await this.service.saveImage(
      image,
      uploadImageDto,
      param.id,
      productImageFillable,
    );

    return apiCreated('Product image uploaded', data);
  }

  @Put('/:id/image/:resourceId')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('update-product')
  async updateImageDetail(
    @Param() param: MongoIdPipe,
    @Body() uploadImageDto: UploadProductImageDto,
  ): Promise<IApiItem<IProduct>> {
    const data = await this.service.updateImageDetail(
      uploadImageDto,
      param.id,
      param.resourceId,
      productImageFillable,
    );

    return apiUpdated('Product image detail updated', data);
  }

  @Delete('/:id/image/:resourceId')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @Permission('update-product')
  async deleteProductImage(
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem<IProduct>> {
    const data = await this.service.deleteProductImage(
      param.id,
      param.resourceId,
    );

    return apiUpdated('Product image detail updated', data);
  }
}
