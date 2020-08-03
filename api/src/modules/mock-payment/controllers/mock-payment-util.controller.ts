import { PermissionGuard } from '@/libs/permission.guard';
import { IRequest } from '@/modules/shared/interfaces/express.interface';
import { MongoIdPipe } from '@/modules/shared/pipes/mongoId.pipe';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { apiCreated, apiItem } from '../../helpers/responseParser';
import { EResources } from '../../shared/enums/resource.enum';
import { IApiItem } from '../../shared/interfaces/response-parser.interface';
import { IMockPayment } from '../mock-payment.interface';
import { MockPaymentService } from '../mock-payment.service';

@Controller('/api/mock-payment-utils')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MockPaymentUtilController {
  constructor(private readonly service: MockPaymentService) {}

  // show all user payment methods
  @Get()
  async getByUserId(@Req() req: IRequest): Promise<IApiItem<IMockPayment>> {
    const data = await this.service.getByUserId(req.user._id);
    return apiItem(EResources.MockPayment, data);
  }
  // show payment method by provider id
  // add user payment method by provider id
  @Post(':id')
  async addPaymentMethod(
    @Param() param: MongoIdPipe,
    @Req() req: IRequest,
    @Body('balance') balance: number,
  ): Promise<IApiItem<IMockPayment>> {
    const data = await this.service.topUp(param.id, req.user._id, balance);
    return apiCreated(EResources.MockPayment, data);
  }
  // top up balance by provider id
  // get balance
}
