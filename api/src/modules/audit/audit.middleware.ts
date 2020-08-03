import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { IRequest } from '../shared/interfaces/express.interface';
import { AuditService } from './audit.service';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private readonly auditService: AuditService) {}
  async use(req: IRequest, res: Response, next: NextFunction): Promise<void> {
    await this.auditService.saveAudit(req);
    next();
  }
}
