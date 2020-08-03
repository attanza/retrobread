import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class MockPaymentConsumer {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsNumber()
  balance: number;
}

export class CreateMockPaymentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  provider: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  consumers: MockPaymentConsumer[];
}

export class UpdateMockPaymentDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider: string;

  @IsOptional()
  @IsArray()
  @ValidateNested()
  consumers: MockPaymentConsumer[];
}
