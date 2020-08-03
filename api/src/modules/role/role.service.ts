import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { BaseDbService } from '../shared/services/base-db.service';
import { IRole } from './role.interface';
@Injectable()
export class RoleService extends BaseDbService<IRole> {
  constructor(@InjectModel('Role') private model: PaginateModel<IRole>) {
    super(model);
  }

  async allRoles(): Promise<IRole[]> {
    return this.model.find().lean();
  }

  async getRoleBySlug(slug: string): Promise<IRole> {
    return this.model.findOne({ slug });
  }
}
