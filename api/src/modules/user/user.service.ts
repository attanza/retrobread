import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { RoleService } from '../role/role.service';
import { BaseDbService } from '../shared/services/base-db.service';
import { IUser } from './user.interface';
@Injectable()
export class UserService extends BaseDbService<IUser> {
  constructor(
    @InjectModel('User') private model: PaginateModel<IUser>,
    private readonly roleService: RoleService,
  ) {
    super(model);
  }

  async roleExists(id: string): Promise<void> {
    const found = await this.roleService.findById(id);
    if (!found) {
      throw new BadRequestException('role not found');
    }
  }

  async getByUid(uid: string): Promise<IUser> {
    return this.model
      .findOne({ $or: [{ email: uid }, { phone: uid }] })
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
        },
      })
      .exec();
  }

  async getByIdWithRolePermissions(id: string): Promise<IUser> {
    return this.model
      .findById(id)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
        },
      })
      .exec();
  }

  async allUser(): Promise<IUser[]> {
    return this.model.find().lean();
  }
}
