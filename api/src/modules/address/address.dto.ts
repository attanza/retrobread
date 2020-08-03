import {
  IsBoolean,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { EAddressType } from './address.interface';

export class CreateAddressDto {
  @IsNotEmpty()
  @IsString()
  street: string;

  @IsNotEmpty()
  @IsString()
  district: string;

  @IsNotEmpty()
  @IsString()
  village: string;

  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  province: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  postCode: string;

  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  @IsIn([
    EAddressType.Home,
    EAddressType.Office,
    EAddressType.Apartment,
    EAddressType.Other,
  ])
  addressType: EAddressType;

  @IsNotEmpty()
  @IsBoolean()
  default: boolean;
}

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  village: string;

  @IsOptional()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  postCode: string;

  @IsOptional()
  @IsLatitude()
  latitude: number;

  @IsOptional()
  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsString()
  @IsIn([
    EAddressType.Home,
    EAddressType.Office,
    EAddressType.Apartment,
    EAddressType.Other,
  ])
  addressType: EAddressType;

  @IsOptional()
  @IsBoolean()
  default: boolean;
}
