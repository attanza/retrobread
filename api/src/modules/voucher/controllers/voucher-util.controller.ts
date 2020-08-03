import { PermissionGuard } from '@/libs/permission.guard';
import { apiSucceed } from '@/modules/helpers/responseParser';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IVoucher } from '../voucher.interface';
import { VoucherService } from '../voucher.service';

@Controller('/api/voucher-utils')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class VoucherUtilController {
  constructor(private readonly service: VoucherService) {}

  @Post('invalidate')
  async invalidate(): Promise<IApiItem<IVoucher>> {
    await this.service.invalidateVoucher();

    return apiSucceed('Vouchers invalidated');
  }
}
