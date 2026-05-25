import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LoggingService } from './logging.service';

@Catch()
export class SeedExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (typeof exception === 'string') {
      message = exception;
    }

    const rawMessage = (message && typeof message === 'string') ? message : JSON.stringify(message);
    const isSeeded = typeof rawMessage === 'string' && rawMessage.startsWith('SEED_ID:');
    let seedId: string | null = null;
    if (isSeeded) {
      const parts = rawMessage.split(':');
      seedId = parts.length >= 2 ? parts[1] : rawMessage;
    }

    const entry = {
      time: new Date().toISOString(),
      path: req.path,
      method: req.method,
      status,
      message: rawMessage,
      isSeeded,
      seedId,
    };
    this.logger.appendError(entry);

    // forward original response to client
    if (exception instanceof HttpException) {
      res.status(status).json(exception.getResponse());
    } else {
      res.status(status).json({ message: rawMessage });
    }
  }
}
