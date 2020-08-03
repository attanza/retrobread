import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log('exception', exception);
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = '';
    if (exception instanceof HttpException) {
      const httpResponse = exception.getResponse() as IExceptionResponse;
      message = httpResponse.message;
    } else {
      message = 'Internal Server Error';
    }

    response.status(status).json({
      meta: {
        status,
        message,
      },
    });
  }
}

interface IExceptionResponse {
  statusCode: number;
  message: string[];
  error: string;
}
