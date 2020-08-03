import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import jwt from 'jsonwebtoken';
import { PaginateModel } from 'mongoose';
import { JwtPayload } from '../auth/auth.interface';
import { IRequest } from '../shared/interfaces/express.interface';
import { BaseDbService } from '../shared/services/base-db.service';
import { IAudit } from './audit.interface';
@Injectable()
export class AuditService extends BaseDbService<IAudit> {
  constructor(@InjectModel('Audit') private model: PaginateModel<IAudit>) {
    super(model);
  }

  async saveAudit(req: IRequest): Promise<void> {
    const body = { ...req.body };
    if (body && body.password) {
      body.password = '******';
    }
    if (body && body.oldPassword) {
      body.oldPassword = '******';
    }

    const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    const auditData = {
      body: JSON.stringify(body),
      query: JSON.stringify(req.query),
      url: req.originalUrl,
      method: req.method,
      headers: JSON.stringify(req.headers),
      ip,
      user: null,
    };
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split('Bearer ')[1];
        if (token) {
          const { uid } = (await jwt.verify(
            token,
            process.env.APP_SECRET,
          )) as JwtPayload;
          auditData.user = uid;
        }
      } catch (error) {}
    }
    await this.model.create(auditData as IAudit);
  }
}
