import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { BaseDbService } from '../shared/services/base-db.service';
import { IPermission } from './permission.interface';
@Injectable()
export class PermissionService extends BaseDbService<IPermission> {
  constructor(
    @InjectModel('Permission') private model: PaginateModel<IPermission>,
  ) {
    super(model);
  }

  async allPermissions(): Promise<IPermission[]> {
    return this.model.find().lean();
  }
}
