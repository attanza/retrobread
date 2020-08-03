import { IPaginateOptions } from '../shared/interfaces/pagination.interface';
import { ResourcePaginationPipe } from '../shared/pipes/resource-pagination.pipe';

interface IConditions {
  [key: string]: any;
}

interface IQueryOutput {
  conditions: IConditions;
  options: IPaginateOptions;
  redisKey: string;
}

export const parseQueryString = (
  query: ResourcePaginationPipe,
): IQueryOutput => {
  const conditions: IConditions = {};
  const page = Number(query.page) || 1;
  const perPage = Number(query.perPage) || 10;
  const projection = {};
  const populate = '';
  if (query.projection && Array.isArray(query.projection)) {
    query.projection.map(p => (projection[p] = 1));
  } else if (query.projection) {
    projection[query.projection] = 1;
  }
  const sort = query.sort || '';
  if (query.fieldKey && query.fieldValue) {
    conditions[query.fieldKey] = query.fieldValue;
  }
  if (query.regexKey && query.regexValue) {
    conditions[query.regexKey] = {
      $regex: query.regexValue,
      $options: 'i',
    };
  }
  const options: IPaginateOptions = {
    page,
    perPage,
    lean: false,
    projection,
    sort,
    populate,
  };

  let redisKey = '_';
  Object.values(options).map(o => {
    if (typeof o !== 'object') redisKey += o;
    else redisKey += Object.keys(o).join('');
  });

  return { options, conditions, redisKey };
};
