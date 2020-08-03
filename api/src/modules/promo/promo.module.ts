import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromoUtilController } from './controllers/promo-util.controller';
import { PromoController } from './controllers/promo.controller';
import { PromoSchema } from './promo.schema';
import { PromoService } from './promo.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Promo',
        schema: PromoSchema,
      },
    ]),
  ],
  controllers: [PromoController, PromoUtilController],
  providers: [PromoService],
  exports: [PromoService],
})
export class PromoModule {}
