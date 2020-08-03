import {
  IApiCollection,
  IApiItem,
  IValidationErrorResponse,
} from '@/modules/shared/interfaces/response-parser.interface';

export function resourceListExpects<T>(
  expect: jest.Expect,
  body: IApiCollection<T>,
  resource: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(200);
  expect(body.meta.message).toEqual(`${resource} collection`);
  expect(body.pagination).toBeDefined();
  expect(body.pagination.hasNextPage).toBeDefined();
  expect(body.pagination.hasPrevPage).toBeDefined();
  expect(body.pagination.nextPage).toBeDefined();
  expect(body.pagination.page).toBeDefined();
  expect(body.pagination.perPage).toBeDefined();
  expect(body.pagination.prevPage).toBeDefined();
  expect(body.pagination.totalPages).toBeDefined();
  expect(body.data).toBeDefined();
  expect(Array.isArray(body.data)).toBeTruthy();
}

export function createExpect<T>(
  expect: jest.Expect,
  body: IApiItem<T>,
  resource: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(201);
  expect(body.meta.message).toEqual(`${resource} created`);
  expect(body.data).toBeDefined();
}

export function showExpect<T>(
  expect: jest.Expect,
  body: IApiItem<T>,
  resource: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(200);
  expect(body.meta.message).toEqual(`${resource} item retrieved`);
  expect(body.data).toBeDefined();
}

export function updateExpect<T>(
  expect: jest.Expect,
  body: IApiItem<T>,
  resource: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(200);
  expect(body.meta.message).toEqual(`${resource} updated`);
  expect(body.data).toBeDefined();
}

export function deleteExpect<T>(
  expect: jest.Expect,
  body: IApiItem<T>,
  resource: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(200);
  expect(body.meta.message).toEqual(`${resource} deleted`);
}

export function validationFailedExpect(
  expect: jest.Expect,
  body: IValidationErrorResponse,
  errMessage: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(400);
  expect(Array.isArray(body.meta.message)).toBeTruthy();
  expect(body.meta.message.includes(errMessage)).toBeTruthy();
}

export function unauthorizedExpect(
  expect: jest.Expect,
  body: IValidationErrorResponse,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(401);
  expect(body.meta.message).toEqual('Unauthorized');
}

export function forbiddenExpect(
  expect: jest.Expect,
  body: IValidationErrorResponse,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(403);
  expect(body.meta.message).toEqual('Forbidden resource');
}

export function duplicateErrorExpect(
  expect: jest.Expect,
  body: IValidationErrorResponse,
  field: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(400);
  const errMessage = `${field} is already exists`;
  expect(body.meta.message).toEqual(errMessage);
}

export function generalErrorExpect(
  expect: jest.Expect,
  body: IValidationErrorResponse,
  errMessage: string,
): void {
  expect(body.meta).toBeDefined();
  expect(body.meta.status).toEqual(400);
  expect(body.meta.message).toEqual(errMessage);
}
