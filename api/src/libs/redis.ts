import { Logger } from '@nestjs/common';
import ioredis from 'ioredis';

class RedisInstance {
  redis;
  defaultExpiry = 60 * 60; // 1 hours
  constructor() {
    this.redis = new ioredis(6379, process.env.REDIS_URL, {
      keyPrefix: process.env.REDIS_PREFIX,
    });
  }

  async set(
    key: string,
    value: any,
    exp: number = this.defaultExpiry,
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', exp);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (data == null) return null;
    else {
      Logger.log(`GET ${key}`, 'REDIS');
      return JSON.parse(data);
    }
  }

  async del(key: string): Promise<void> {
    Logger.log(`DELETE ${key}`, 'REDIS');
    await this.redis.del(key);
  }

  async getStream(pattern: string): Promise<string[]> {
    const prefix: string = process.env.REDIS_PREFIX;
    return new Promise(resolve => {
      const stream = this.redis.scanStream({
        match: `${prefix}${pattern}*`,
        count: 10,
      });
      stream.on('data', resultKeys => {
        resolve(resultKeys);
      });
      stream.on('end', () => {
        return resolve();
      });
    });
  }

  async deletePattern(pattern: string): Promise<void> {
    const prefix: string = process.env.REDIS_PREFIX;
    return new Promise(resolve => {
      const stream = this.redis.scanStream({
        match: `${prefix}${pattern}*`,
        count: 10,
      });
      stream.on('data', resultKeys => {
        resultKeys.map(key => {
          this.del(key.split(prefix)[1]);
        });
        Logger.log(`DELETE PATTERN ${pattern}`, 'REDIS');
      });
      stream.on('end', () => {
        resolve();
      });
    });
  }

  async flushall() {
    await this.redis.flushall();
  }
}

export const Redis = new RedisInstance();
