import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { IProductImage } from './product.interface';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories: string[];

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPrice: number;

  @IsOptional()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  description: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  categories: string[];

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  discountPrice: number;

  @IsOptional()
  @IsNumber()
  stock: number;

  @IsOptional()
  @IsString()
  description: string;
}

export class UploadProductImageDto implements Partial<IProductImage> {
  @IsOptional()
  @IsBoolean()
  published: boolean;

  @IsOptional()
  @IsBoolean()
  default: boolean;
}
