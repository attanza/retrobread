import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './libs/http-exception.filter';
import MqttHandler from './libs/mqttHandler';
async function bootstrap() {
  process.env.TZ = 'Asia/Jakarta';
  const PORT = process.env.PORT;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(morgan('combined'));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe());
  mongoose.set('debug', true);
  MqttHandler.connect();
  await app.listen(PORT);
  Logger.log(`Server running on http://localhost:${PORT}`, 'bootstrap');
}
bootstrap();
