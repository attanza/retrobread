import { ResourcePaginationPipe } from '../pipes/resource-pagination.pipe';

export interface IResourceCollection {
  resource: string;
  relations?: string;
  query: ResourcePaginationPipe;
  cache?: boolean;
}
export interface IResourceShow {
  resource: string;
  id: string;
  relations?: string;
  cache?: boolean;
}

export interface IResourceStore {
  resource: string;
  createDto: any;
  uniques?: string[];
  relations?: string;
  fillable: string[];
}

export interface IResourceUpdate {
  resource: string;
  id: string;
  updateDto: any;
  uniques?: string[];
  relations?: string;
  fillable: string[];
  dbOptions?: IDbOptions;
}

export interface IResourceDestroy {
  resource: string;
  id: string;
  imageKey?: string;
  dbOptions?: IDbOptions;
}

export interface IDbOptions {
  [key: string]: any;
}
