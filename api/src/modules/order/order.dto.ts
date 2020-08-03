import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { EOrderStatus } from './order.interface';

export class OrderProductDto {
  @IsNotEmpty()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  qty: number;
}
export class CreateOrderDto {
  @ValidateIf(o => o.packages == null)
  @Type(() => OrderProductDto)
  @ValidateNested({ each: true })
  products: OrderProductDto[];

  @ValidateIf(o => o.products == null)
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  packages: string[];

  @IsOptional()
  voucher: string;

  @IsNotEmpty()
  @IsMongoId()
  courier: string;

  @IsNotEmpty()
  @IsMongoId()
  payWith: string;

  @IsNotEmpty()
  @IsMongoId()
  address: string;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  products: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  packages: string[];

  @IsOptional()
  @IsMongoId()
  voucher: string;

  @IsOptional()
  @IsIn(getOrderStatus())
  status: EOrderStatus;
}

function getOrderStatus(): string[] {
  const status = [];
  for (const s in EOrderStatus) {
    status.push(s);
  }
  return status;
}
