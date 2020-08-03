export interface IPaginateResult<T> {
  pagination: IPagination;
  data: T[];
}

export interface IPagination {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
  perPage: number;
  page?: number | null;
  totalPages?: number;
}

interface IObject {
  [key: string]: any;
}

interface CollationOptions {
  locale?: string;
  caseLevel?: boolean;
  caseFirst?: string;
  strength?: number;
  numericOrdering?: boolean;
  alternate?: string;
  maxVariable?: string;
  backwards?: boolean;
}

export interface IPaginateOptions {
  select?: IObject | string;
  sort?: IObject | string;
  collation?: CollationOptions;
  projection?: IObject | string;
  populate?: IObject[] | string[] | IObject | string;
  lean?: boolean;
  page?: number;
  perPage?: number;
}
