import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { BaseDbService } from '../shared/services/base-db.service';
import { IAddress } from './address.interface';

@Injectable()
export class AddressService extends BaseDbService<IAddress> {
  constructor(@InjectModel('Address') private model: PaginateModel<IAddress>) {
    super(model);
  }
}
