import { Document } from 'mongoose';

export interface IAddress extends Document {
  _id: string;
  street: string;
  district: string;
  village: string;
  user: string;
  city: string;
  province: string;
  country: string;
  postCode: string;
  latitude: number;
  longitude: number;
  addressType: EAddressType;
  default: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum EAddressType {
  Home = 'Home',
  Office = 'Office',
  Apartment = 'Apartment',
  Other = 'Other',
}

export const addressFillable = [
  'street',
  'district',
  'village',
  'user',
  'city',
  'province',
  'country',
  'postCode',
  'latitude',
  'longitude',
  'addressType',
  'default',
];
