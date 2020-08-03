import { PermissionGuard } from '@/libs/permission.guard';
import { apiSucceed } from '@/modules/helpers/responseParser';
import { IApiItem } from '@/modules/shared/interfaces/response-parser.interface';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetDistancePrice, GetDistanceQuery } from '../mock-courier.dto';
import { MockCourierService } from '../mock-courier.service';

@Controller('/api/mock-courier')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
export class MockCourierUtilController {
  constructor(private readonly service: MockCourierService) {}

  @Get('distance')
  getDistance(@Query() query: GetDistanceQuery): IApiItem<any> {
    const distance = this.service.getDistance(query);
    const data = {
      distance,
      distanceStr: `${distance} Km`,
    };
    return apiSucceed('Distance', data);
  }

  @Post('distance')
  async getPrice(@Body() body: GetDistancePrice): Promise<IApiItem<any>> {
    const price = await this.service.getDistancePrice(body);
    console.log('price', price);
    const data = {
      price,
    };
    return apiSucceed('Price', data);
  }
}
