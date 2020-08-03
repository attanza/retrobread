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
} from '../../helpers/responseParser';
import { EResources } from '../../shared/enums/resource.enum';
import { IResourceCollection } from '../../shared/interfaces/db-resource.interface';
import { IFile } from '../../shared/interfaces/multer.interface';
import {
  IApiCollection,
  IApiItem,
} from '../../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../../shared/pipes/resource-pagination.pipe';
import { CreatePromoDto, UpdatePromoDto } from '../promo.dto';
import promoInterceptor from '../promo.interceptor';
import { IPromo, promoFillable } from '../promo.interface';
import { PromoService } from '../promo.service';

@Controller('/api/promos')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PromoController {
  constructor(private readonly service: PromoService) {}

  @Get()
  @Permission('read-promo')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IPromo>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Promo,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Promo, data);
  }

  @Get(':id')
  @Permission('read-promo')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IPromo>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Promo,
      cache: true,
    });
    return apiItem(EResources.Promo, data);
  }

  @Post()
  @Permission('create-promo')
  async create(@Body() createDto: CreatePromoDto): Promise<IApiItem<IPromo>> {
    const data = await this.service.create({
      createDto,
      resource: EResources.Promo,
      fillable: promoFillable,
    });

    return apiCreated(EResources.Promo, data);
  }

  @Put(':id')
  @Permission('update-promo')
  async update(
    @Param() param: MongoIdPipe,
    @Body() updateDto: UpdatePromoDto,
  ): Promise<IApiItem<IPromo>> {
    const data = await this.service.update({
      updateDto,
      id: param.id,
      resource: EResources.Promo,
      fillable: promoFillable,
    });
    return apiUpdated(EResources.Promo, data);
  }

  @Delete(':id')
  @Permission('delete-promo')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IPromo>> {
    const { id } = param;
    await this.service.destroy({
      id,
      resource: EResources.Promo,
      imageKey: 'image',
    });
    return apiDeleted(EResources.Promo);
  }

  @Post('/:id/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', promoInterceptor))
  async uploadFile(
    @Param() param: MongoIdPipe,
    @UploadedFile() image: IFile,
  ): Promise<IApiItem<IPromo>> {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }
    const updated = await this.service.saveImage(image, param.id);
    return apiItem(EResources.ProductPackage, updated);
  }
}
