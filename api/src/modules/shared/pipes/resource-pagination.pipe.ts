import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class ResourcePaginationPipe {
  @IsOptional()
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsNumberString()
  perPage: number;

  @IsOptional()
  projection: string;

  @IsOptional()
  @IsString()
  sort: string;

  @IsOptional()
  @IsString()
  fieldKey: string;

  @IsOptional()
  @IsString()
  fieldValue: string;

  @IsOptional()
  @IsString()
  regexKey: string;

  @IsOptional()
  @IsString()
  regexValue: string;
}

export enum ESortMode {
  asc = 1,
  desc = -1,
}
