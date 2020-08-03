import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DB_URL,
  name: process.env.DB_NAME,
}));
