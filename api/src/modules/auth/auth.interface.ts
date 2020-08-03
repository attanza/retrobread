import { Meta } from '../shared/interfaces/response-parser.interface';

export enum EProvider {
  LOCAL = 'local',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

export interface LoginOutput {
  meta: Meta;
  data: LoginData;
}

export interface LoginData {
  token: string;
  refreshToken: string;
}

export interface JwtPayload {
  uid: string;
  tokenCount: number;
}
export interface RefreshTokenPayload {
  uid: string;
  token: string;
  tokenCount: number;
}

export interface RegisterOutput {
  token: string;
}
