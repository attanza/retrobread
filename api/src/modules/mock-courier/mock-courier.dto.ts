import {
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMockCourierDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  provider: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}

export class UpdateMockCourierDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider: string;

  @IsOptional()
  @IsNumber()
  price: number;
}

export class GetDistanceQuery {
  @IsNotEmpty()
  @IsLatitude()
  lat1: number;

  @IsNotEmpty()
  @IsLatitude()
  lat2: number;

  @IsNotEmpty()
  @IsLongitude()
  lng1: number;

  @IsNotEmpty()
  @IsLongitude()
  lng2: number;
}

export class GetDistancePrice extends GetDistanceQuery {
  @IsNotEmpty()
  @IsMongoId()
  providerId: string;
}
