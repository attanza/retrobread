import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../user/user.module';
import { AddressSchema } from './address.schema';
import { AddressService } from './address.service';
import { AddressController } from './controllers/address.controller';
import { MyAddressController } from './controllers/my-address.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Address',
        schema: AddressSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [AddressController, MyAddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
