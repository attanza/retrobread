import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SeederService } from './modules/shared/services/seeder.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly seederService: SeederService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/seeder')
  async seeder(): Promise<string> {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      await this.seederService.runSeeder();
      return 'Seeder completed';
    }
    return 'Seeder can only run in development';
  }
}
