import { Document } from 'mongoose';

export interface IPoint {
  lat: number;
  lng: number;
}

export interface IPointQuery {
  lat1: number;
  lat2: number;
  lng1: number;
  lng2: number;
}

export interface IMockCourier extends Document {
  _id: string;
  provider: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export const mockCourierFillable = ['provider', 'price'];
