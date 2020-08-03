import MqttHandler from '@/libs/mqttHandler';
import { Redis } from '@/libs/redis';
import { parseQueryString } from '@/modules/helpers/parseQueryString';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import fs from 'fs';
import { PaginateModel } from 'mongoose';
import {
  IDbOptions,
  IResourceCollection,
  IResourceDestroy,
  IResourceShow,
  IResourceStore,
  IResourceUpdate,
} from '../interfaces/db-resource.interface';
import { IPaginateResult } from '../interfaces/pagination.interface';

@Injectable()
export abstract class BaseDbService<T> {
  private readonly dbModel: PaginateModel<any>;
  constructor(model: PaginateModel<any>) {
    this.dbModel = model;
  }

  /**
   * GET PAGINATED
   * @param ctx
   */
  async getAll(ctx: IResourceCollection): Promise<IPaginateResult<T>> {
    try {
      const { query, cache, resource } = ctx;
      const { conditions, options, redisKey } = parseQueryString(query);
      const conditionsLength = Object.keys(conditions).length;
      if (cache && conditionsLength === 0) {
        const cacheData = await Redis.get<IPaginateResult<T>>(
          resource + redisKey,
        );
        if (cacheData) {
          return cacheData;
        }
      }
      const data = await this.dbModel.paginate(conditions, options);
      if (cache && conditionsLength === 0) {
        await Redis.set(resource + redisKey, data);
      }
      return data;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * CREATE RESOURCE
   * @param resourceStore
   */
  async create(resourceStore: IResourceStore): Promise<T> {
    const { uniques, createDto, resource, fillable } = resourceStore;
    if (uniques && uniques.length > 0) {
      for (const key of uniques) {
        await this.isUnique(key, createDto[key]);
      }
    }

    const createData = {};
    fillable.map(key => {
      if (createDto[key]) {
        createData[key] = createDto[key];
      }
    });

    const created = await this.dbModel.create(createData);
    await Redis.deletePattern(resource);

    const topic = `${process.env.DB_NAME}/create/${resource}`;
    MqttHandler.sendMessage(topic, JSON.stringify(created.toJSON()));
    return created;
  }

  /**
   * SHOW RESOURCE BY ID
   * @param resourceShow
   */
  async show(resourceShow: IResourceShow): Promise<T> {
    const { id, resource, cache, relations } = resourceShow;
    const redisKey = `${resource}_${id}`;
    if (cache) {
      const cacheData = await Redis.get<T>(redisKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const data = await this.getById(id, relations);
    if (cache) {
      await Redis.set(redisKey, data);
    }
    return data;
  }

  /**
   * GET RESOURCE BY ID WITH ERROR
   * @param id
   * @param relations
   */
  async getById(id: string, relations = ''): Promise<T> {
    const found = await this.dbModel.findById(id).populate(relations);
    if (!found) {
      throw new BadRequestException('Resource not found');
    }
    return found;
  }

  /**
   * GET RESOURCE BY ID
   * @param id
   */
  async findById(id: string): Promise<T> {
    return this.dbModel.findById(id);
  }

  async showOneWithOptions(
    options: IDbOptions,
    resource: string,
    cache = true,
  ): Promise<T> {
    const redisKey = `${resource}_${Object.values(options).join('')}`;
    if (cache) {
      const cacheData = await Redis.get<T>(redisKey);
      if (cacheData) return cacheData;
    }

    const data = await this.getOneWithOptions(options);
    if (cache) {
      await Redis.set(redisKey, data);
    }
    return data;
  }
  async getOneWithOptions(options: IDbOptions): Promise<T> {
    const data = await this.dbModel.findOne(options);
    if (!data) {
      throw new BadRequestException('Resource not found');
    }
    return data;
  }

  /**
   * UPDATE RESOURCE BY ID
   * @param resourceStore
   */
  async update(resourceStore: IResourceUpdate): Promise<T> {
    const { uniques, updateDto, id, resource, dbOptions } = resourceStore;
    let data: T;
    if (dbOptions) {
      data = await this.getOneWithOptions(dbOptions);
    } else {
      data = await this.getById(id);
    }
    if (uniques && uniques.length > 0) {
      for (const key of uniques) {
        await this.isUnique(key, updateDto[key], id);
      }
    }
    Object.keys(updateDto).map(key => (data[key] = updateDto[key]));
    await this.dbModel.updateOne({ _id: id }, updateDto);
    await Redis.deletePattern(resource);
    const topic = `${process.env.DB_NAME}/update/${resource}`;
    MqttHandler.sendMessage(topic, JSON.stringify(data));
    return data;
  }

  /**
   * DELETE RESOURCE BY ID
   * @param resourceDestroy
   */
  async destroy(resourceDestroy: IResourceDestroy): Promise<string> {
    const { id, resource, dbOptions, imageKey } = resourceDestroy;
    let data: any;
    if (dbOptions) {
      data = await this.getOneWithOptions(dbOptions);
      await this.dbModel.deleteOne(dbOptions);
    } else {
      data = await this.getById(id);
      await this.dbModel.deleteOne({ _id: id });
    }
    if (imageKey) {
      await this.unlinkImage(data, imageKey);
    }

    await Redis.deletePattern(resource);
    const topic = `${process.env.DB_NAME}/delete/${resource}`;
    MqttHandler.sendMessage(topic, JSON.stringify(data));

    return 'Resource deleted';
  }

  /**
   * CHECK IF DB FIELD IS ALREADY EXISTS
   * @param key
   * @param value
   * @param id
   */
  async isUnique(
    key: string,
    value: string | number,
    id?: string,
  ): Promise<boolean> {
    const found = await this.dbModel
      .findOne({ [key]: value })
      .select('_id')
      .exec();
    if (found && id && found._id.toString() === id.toString()) {
      return true;
    } else if (found) {
      throw new BadRequestException(`${key} is already exists`);
    } else {
      return true;
    }
  }

  /**
   * CHECK IF DB FIELD IS EXISTS
   * @param key
   * @param value
   * @param resource
   */
  async isExists(
    key: string,
    value: string[],
    resource: string,
  ): Promise<boolean> {
    const found = await this.dbModel
      .find({ [key]: { $in: value } })
      .select('_id')
      .lean();
    if (!found) {
      throw new BadRequestException(`one of ${resource} is not exists`);
    }
    if (found.length !== value.length) {
      throw new BadRequestException(`one of ${resource} is not exists`);
    }

    return true;
  }

  /**
   * INSERT BULK RESOURCE
   * @param data
   */
  async insertMany(data: any[]): Promise<T[]> {
    return this.dbModel.insertMany(data);
  }

  /**
   * DELETE BULK RESOURCE
   */
  async deleteMany(): Promise<void> {
    await this.dbModel.deleteMany({});
  }

  async unlinkImage(data: T, imageKey: string): Promise<void> {
    if (data && data[imageKey] && data[imageKey] !== '') {
      const filePath = 'public' + data[imageKey];
      try {
        if (await fs.promises.stat(filePath)) {
          await fs.promises.unlink(filePath);
          Logger.log(`Unlink ${filePath}`, 'Node FS');
        }
      } catch (e) {
        Logger.log(JSON.stringify(e), 'Node FS');
      }
    }
  }
}
