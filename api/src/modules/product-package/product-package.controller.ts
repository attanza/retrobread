import { Permission } from '@/libs/permission.decorator';
import { PermissionGuard } from '@/libs/permission.guard';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import {
  apiCollection,
  apiCreated,
  apiDeleted,
  apiItem,
  apiUpdated,
} from '../helpers/responseParser';
import { ProductService } from '../product/product.service';
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
  CreateProductPackageDto,
  UpdateProductPackageDto,
} from './product-package.dto';
import productPackageInterceptor from './product-package.interceptor';
import {
  IProductPackage,
  productPackageFillable,
} from './product-package.interface';
import { ProductPackageService } from './product-package.service';

@Controller('/api/product-packages')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class ProductPackageController {
  private readonly uniques = ['name'];
  constructor(
    private readonly service: ProductPackageService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  @Permission('read-product-package')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IProductPackage>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.ProductPackage,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.ProductPackage, data);
  }

  @Get(':id')
  @Permission('read-product-package')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IProductPackage>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.ProductPackage,
      cache: true,
      relations: 'products',
    });
    return apiItem(EResources.ProductPackage, data);
  }

  @Post()
  @Permission('create-product-package')
  async create(
    @Body() createDto: CreateProductPackageDto,
  ): Promise<IApiItem<IProductPackage>> {
    await this.productService.isExists('_id', createDto.products, 'products');
    const data = await this.service.create({
      createDto,
      uniques: this.uniques,
      resource: EResources.ProductPackage,
      fillable: productPackageFillable,
    });

    return apiCreated(EResources.ProductPackage, data);
  }

  @Put(':id')
  @Permission('update-product-package')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdateProductPackageDto,
  ): Promise<IApiItem<IProductPackage>> {
    if (updateDto.products) {
      await this.productService.isExists('_id', updateDto.products, 'products');
    }
    const data = await this.service.update({
      updateDto,
      uniques: this.uniques,
      id: param.id,
      resource: EResources.ProductPackage,
      fillable: productPackageFillable,
    });
    return apiUpdated(EResources.ProductPackage, data);
  }

  @Delete(':id')
  @Permission('delete-product-package')
  async destroy(
    @Param() param: MongoIdPipe,
  ): Promise<IApiItem<IProductPackage>> {
    const { id } = param;
    await this.service.destroy({ id, resource: EResources.ProductPackage });
    return apiDeleted(EResources.ProductPackage);
  }

  @Post('/:id/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', productPackageInterceptor))
  async uploadFile(
    @Param() param: MongoIdPipe,
    @UploadedFile() image: IFile,
  ): Promise<IApiItem<IProductPackage>> {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }
    const updated = await this.service.saveImage(image, param.id);
    return apiItem(EResources.ProductPackage, updated);
  }
}
