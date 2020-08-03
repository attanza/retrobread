import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { BaseDbService } from '../shared/services/base-db.service';
import { ICategory } from './category.interface';

@Injectable()
export class CategoryService extends BaseDbService<ICategory> {
  constructor(
    @InjectModel('Category') private model: PaginateModel<ICategory>,
  ) {
    super(model);
  }

  async allCategories(): Promise<
    Pick<
      ICategory,
      '_id' | 'name' | 'slug' | 'description' | 'createdAt' | 'updatedAt'
    >[]
  > {
    return this.model.find().lean();
  }
}
