import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePromoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(250)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  subtitle: string;

  @IsNotEmpty()
  @IsDateString()
  validFrom: Date;

  @IsNotEmpty()
  @IsDateString()
  validUntil: Date;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  published: boolean;
}

export class UpdatePromoDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  subtitle: string;

  @IsOptional()
  @IsDateString()
  validFrom: Date;

  @IsOptional()
  @IsDateString()
  validUntil: Date;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  published: boolean;
}
