import { IPaginateResult } from '../shared/interfaces/pagination.interface';
import {
  IApiCollection,
  IApiItem,
  Meta,
} from '../shared/interfaces/response-parser.interface';

export function apiCollection<T>(
  resource: string,
  data: IPaginateResult<T>,
): IApiCollection<T> {
  const meta: Meta = {
    status: 200,
    message: `${resource} collection`,
  };

  return { meta, pagination: data.pagination, data: data.data };
}

export function apiItem<T>(resource: string, data: T): IApiItem<T> {
  const meta: Meta = {
    status: 200,
    message: `${resource} item retrieved`,
  };

  return { meta, data };
}

export function apiCreated<T>(resource: string, data: T): IApiItem<T> {
  const meta: Meta = {
    status: 201,
    message: `${resource} created`,
  };

  return { meta, data };
}

export function apiUpdated<T>(resource: string, data: T): IApiItem<T> {
  const meta: Meta = {
    status: 200,
    message: `${resource} updated`,
  };

  return { meta, data };
}

export function apiDeleted<T>(resource: string): IApiItem<T> {
  const meta: Meta = {
    status: 200,
    message: `${resource} deleted`,
  };

  return { meta };
}

export function apiSucceed<T>(message: string, data?: T): IApiItem<T> {
  const meta: Meta = {
    status: 200,
    message,
  };

  return { meta, data };
}
