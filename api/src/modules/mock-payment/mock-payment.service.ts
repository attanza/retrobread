import { Redis } from '@/libs/redis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { EResources } from '../shared/enums/resource.enum';
import { BaseDbService } from '../shared/services/base-db.service';
import { IMockPayment } from './mock-payment.interface';

@Injectable()
export class MockPaymentService extends BaseDbService<IMockPayment> {
  constructor(
    @InjectModel('MockPayment') private model: PaginateModel<IMockPayment>,
  ) {
    super(model);
  }

  async getBalance(id: string): Promise<number> {
    const options = {
      'consumers._id': id,
    };
    const provider = await this.getOneWithOptions(options);
    return provider.consumers[0].balance;
  }

  async reduceBalance(
    providerId: string,
    userId: string,
    amount: number,
  ): Promise<void> {
    const options = {
      _id: providerId,
      'consumers.user': userId,
    };
    const provider = await this.getOneWithOptions(options);
    const consumers = [...provider.consumers];
    consumers[0].balance = consumers[0].balance - amount;
    provider.consumers = consumers;
    await provider.save();
  }

  async getByUserId(userId: string): Promise<IMockPayment> {
    const options = {
      'consumers.user': userId,
    };
    const payment = await this.getOneWithOptions(options);
    return payment;
  }

  async topUp(
    providerId: string,
    userId: string,
    balance = 0,
  ): Promise<IMockPayment> {
    await Redis.deletePattern(EResources.MockPayment);
    const payment = await this.findById(providerId);
    if (!payment) {
      throw new BadRequestException('Payment provider not found');
    }
    const consumers = payment.consumers;
    if (consumers.length > 0) {
      const idx = consumers.findIndex(c => c.user.toString() === userId);
      if (idx !== -1) {
        payment.consumers[idx].balance = balance;
        await payment.save();
        return payment;
      }
    }
    consumers.push({ user: userId, balance });
    payment.consumers = consumers;
    await payment.save();
    return payment;
  }
}
