import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { apiSucceed } from '../helpers/responseParser';
import { IApiItem } from '../shared/interfaces/response-parser.interface';
import { LoginDto, RefreshTokenDto, RegisterDto } from './auth.dto';
import { LoginData, RegisterOutput } from './auth.interface';
import { AuthService } from './auth.service';

@Controller('/api')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<IApiItem<LoginData>> {
    const loginData = await this.service.login(loginDto);
    return apiSucceed('Login succeeded', loginData);
  }

  @Post('/refreshToken')
  @HttpCode(200)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<IApiItem<LoginData>> {
    const tokenData = await this.service.refreshToken(refreshTokenDto);
    return apiSucceed('Refresh token succeeded', tokenData);
  }

  @Post('/register')
  @HttpCode(200)
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<IApiItem<RegisterOutput>> {
    const tokenData = await this.service.register(registerDto);
    return apiSucceed('User registration succeeded', tokenData);
  }

  @Get('/confirm/:token')
  async confirm(@Param('token') token: string): Promise<IApiItem<string>> {
    await this.service.confirm(token);
    return apiSucceed('User confirmed');
  }

  @Get('/forgotPassword/:uid')
  async forgotPassword(@Param('uid') uid: string): Promise<IApiItem<string>> {
    await this.service.forgotPassword(uid);
    return apiSucceed('Reset password succeeded');
  }
}
