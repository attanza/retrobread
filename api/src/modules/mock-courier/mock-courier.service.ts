import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { geoFunctions } from 'geo-points-and-paths';
import { PaginateModel } from 'mongoose';
import { BaseDbService } from '../shared/services/base-db.service';
import { GetDistancePrice, GetDistanceQuery } from './mock-courier.dto';
import { IMockCourier, IPoint } from './mock-courier.interface';

interface IPointsOutput {
  p1: IPoint;
  p2: IPoint;
}
@Injectable()
export class MockCourierService extends BaseDbService<IMockCourier> {
  constructor(
    @InjectModel('MockCourier') private model: PaginateModel<IMockCourier>,
  ) {
    super(model);
  }
  getPoints(query: GetDistanceQuery): IPointsOutput {
    const p1: IPoint = {
      lat: query.lat1,
      lng: query.lng1,
    };
    const p2: IPoint = {
      lat: query.lat2,
      lng: query.lng2,
    };

    return { p1, p2 };
  }

  getDistance(query: GetDistanceQuery): number {
    const { p1, p2 } = this.getPoints(query);
    const distance = Math.ceil(geoFunctions.p2p(p1, p2) / 1000);
    return distance;
  }

  async getDistancePrice(query: GetDistancePrice): Promise<number> {
    const distance = this.getDistance(query);
    const provider = await this.findById(query.providerId);
    return provider.price * distance;
  }
}
