import { PermissionGuard } from '@/libs/permission.guard';
import { apiSucceed } from '@/modules/helpers/responseParser';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IPromo } from '../promo.interface';
import { PromoService } from '../promo.service';

@Controller('/api/promo-utils')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class PromoUtilController {
  constructor(private readonly service: PromoService) {}

  @Post('invalidate')
  async invalidate(): Promise<IApiItem<IPromo>> {
    await this.service.invalidatePromo();

    return apiSucceed('Promos invalidated');
  }
}
