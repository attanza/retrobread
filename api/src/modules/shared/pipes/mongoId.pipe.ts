import { IsMongoId, IsOptional } from 'class-validator';

export class MongoIdPipe {
  @IsMongoId()
  id: string;

  @IsOptional()
  @IsMongoId()
  resourceId: string;
}
