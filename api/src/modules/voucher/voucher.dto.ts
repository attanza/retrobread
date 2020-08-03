import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { EVoucherType } from './voucher.interface';

function getVoucherTypes(): string[] {
  const voucherTypes = [];
  for (const voucher in EVoucherType) {
    voucherTypes.push(voucher);
  }
  return voucherTypes;
}

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isOneTime: boolean;

  @IsOptional()
  @IsDateString()
  validFrom: Date;

  @IsOptional()
  @IsDateString()
  validUntil: Date;

  @IsOptional()
  @IsArray()
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  days: number[];

  @IsOptional()
  @IsNumberString()
  startHour: string;

  @IsOptional()
  @IsNumberString()
  endHour: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  consumers: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  products: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  productPackages: string[];

  @IsNotEmpty()
  @IsIn(getVoucherTypes())
  voucherType: EVoucherType;

  @IsNotEmpty()
  @IsString()
  voucherValue: string;

  @IsOptional()
  @IsBoolean()
  valid: boolean;
}

export class UpdateVoucherDto {
  @IsOptional()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  isOneTime: boolean;

  @IsOptional()
  @IsDateString()
  validFrom: Date;

  @IsOptional()
  @IsDateString()
  validUntil: Date;

  @IsOptional()
  @IsArray()
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  days: number[];

  @IsOptional()
  @IsNumberString()
  startHour: string;

  @IsOptional()
  @IsNumberString()
  endHour: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  consumers: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  products: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  productPackages: string[];

  @IsOptional()
  @IsIn(getVoucherTypes())
  voucherType: EVoucherType;

  @IsOptional()
  @IsString()
  voucherValue: string;

  @IsOptional()
  @IsBoolean()
  valid: boolean;
}
