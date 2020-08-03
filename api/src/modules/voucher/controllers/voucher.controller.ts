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
import { CreateVoucherDto, UpdateVoucherDto } from '../voucher.dto';
import voucherInterceptor from '../voucher.interceptor';
import { IVoucher, voucherFillable } from '../voucher.interface';
import { VoucherService } from '../voucher.service';

@Controller('/api/vouchers')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class VoucherController {
  constructor(private readonly service: VoucherService) {}

  @Get()
  // @Permission('read-voucher')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IVoucher>> {
    const ctx: IResourceCollection = {
      query,
      cache: true,
      resource: EResources.Voucher,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Voucher, data);
  }

  @Get(':id')
  // @Permission('read-voucher')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IVoucher>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Voucher,
      cache: true,
    });
    return apiItem(EResources.Voucher, data);
  }

  @Post()
  @Permission('create-voucher')
  async create(
    @Body() postData: CreateVoucherDto,
  ): Promise<IApiItem<IVoucher>> {
    const { code, consumers, products, productPackages } = postData;
    await this.service.validateBeforeCreate(
      code,
      consumers,
      products,
      productPackages,
    );
    let createDto: any;
    if (postData.consumers && postData.consumers.length > 0) {
      const consumers = this.service.generateConsumer(postData.consumers);
      createDto = { ...postData, consumers };
    } else {
      createDto = { ...postData };
    }
    const data = await this.service.create({
      createDto,
      resource: EResources.Voucher,
      fillable: voucherFillable,
    });

    return apiCreated(EResources.Voucher, data);
  }

  @Put(':id')
  @Permission('update-voucher')
  async update(
    @Param() param: MongoIdPipe,
    @Body() postData: UpdateVoucherDto,
  ): Promise<IApiItem<IVoucher>> {
    const { code, consumers, products, productPackages } = postData;
    await this.service.validateBeforeCreate(
      code,
      consumers,
      products,
      productPackages,
      param.id,
    );
    let updateDto: any;
    if (postData.consumers && postData.consumers.length > 0) {
      const consumers = this.service.generateConsumer(postData.consumers);
      updateDto = { ...postData, consumers };
    } else {
      updateDto = { ...postData };
    }
    const data = await this.service.update({
      updateDto,
      id: param.id,
      resource: EResources.Voucher,
      fillable: voucherFillable,
    });
    return apiUpdated(EResources.Voucher, data);
  }

  @Delete(':id')
  @Permission('delete-voucher')
  async destroy(@Param() param: MongoIdPipe): Promise<IApiItem<IVoucher>> {
    const { id } = param;
    await this.service.destroy({
      id,
      resource: EResources.Voucher,
      imageKey: 'image',
    });
    return apiDeleted(EResources.Voucher);
  }

  @Post('/:id/image')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('image', voucherInterceptor))
  async uploadFile(
    @Param() param: MongoIdPipe,
    @UploadedFile() image: IFile,
  ): Promise<IApiItem<IVoucher>> {
    if (!image) {
      throw new BadRequestException(
        'image should be in type of jpg, jpeg, png and size cannot bigger than 5MB',
      );
    }
    const updated = await this.service.saveImage(image, param.id);
    return apiItem(EResources.ProductPackage, updated);
  }
}
