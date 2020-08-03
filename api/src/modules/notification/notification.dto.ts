import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsMongoId()
  user: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isRead: boolean;

  @IsNotEmpty()
  @IsMongoId()
  sender: string;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsMongoId()
  user: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  isRead: boolean;

  @IsOptional()
  @IsMongoId()
  sender: string;
}

export class NotificationIdsDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];
}
