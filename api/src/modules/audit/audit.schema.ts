import * as mongoose from 'mongoose';
import { IAudit } from './audit.interface';
export const AuditSchema = new mongoose.Schema<IAudit>(
  {
    body: String,
    query: String,
    url: String,
    method: String,
    headers: String,
    ip: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: true,
    },
  },
  { timestamps: true },
);
AuditSchema.index({ url: 1, method: 1 });
