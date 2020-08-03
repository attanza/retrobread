import { IPagination } from './pagination.interface';

export interface IApiItem<T> {
  meta: Meta;
  data?: T;
}

export interface Meta {
  status: number;
  message: string;
}

export interface IApiCollection<T> {
  meta: Meta;
  pagination: IPagination;
  data: T[];
}

export interface IValidationErrorResponse {
  meta: {
    status: number;
    message: string[];
  };
}
