import { Permission } from '@/libs/permission.decorator';
import { PermissionGuard } from '@/libs/permission.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IAudit } from '../Audit/Audit.interface';
import { apiCollection, apiItem } from '../helpers/responseParser';
import { EResources } from '../shared/enums/resource.enum';
import { IResourceCollection } from '../shared/interfaces/db-resource.interface';
import {
  IApiCollection,
  IApiItem,
} from '../shared/interfaces/response-parser.interface';
import { MongoIdPipe } from '../shared/pipes/mongoId.pipe';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';
import { AuditService } from './audit.service';

@Controller('/api/audits')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class AuditController {
  constructor(private readonly service: AuditService) {}
  @Get()
  @Permission('read-audit')
  async getAll(
    @Query() query: ResourcePaginationPipe,
  ): Promise<IApiCollection<IAudit>> {
    const ctx: IResourceCollection = {
      query,
      cache: false,
      resource: EResources.Audit,
    };
    const data = await this.service.getAll(ctx);
    return apiCollection(EResources.Audit, data);
  }

  @Get(':id')
  @Permission('read-audit')
  async show(@Param() param: MongoIdPipe): Promise<IApiItem<IAudit>> {
    const data = await this.service.show({
      id: param.id,
      resource: EResources.Audit,
      cache: false,
    });
    return apiItem(EResources.Audit, data);
  }
}
