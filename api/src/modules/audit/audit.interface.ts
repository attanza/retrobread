import { Document, PaginateModel } from 'mongoose';

export interface IAudit extends Document {
  _id: string;
  body: string;
  query: string;
  url: string;
  method: string;
  headers: string;
  user: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditJob {
  auditData: IAudit;
  auditModel: PaginateModel<IAudit>;
}
