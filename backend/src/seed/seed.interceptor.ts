import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { SeedService } from './seed.service';
import { LoggingService } from './logging.service';

@Injectable()
export class SeedInterceptor implements NestInterceptor {
  constructor(private seedService: SeedService, private logger: LoggingService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    try {
      const req = context.switchToHttp().getRequest();
      const route = req.path || req.url || '';
      const method = (req.method || 'GET').toUpperCase();
      const matches = this.seedService.match(route, method);
      for (const s of matches) {
        const p = s.probability || 1;
        if (Math.random() <= p) {
          const entry = {
            time: new Date().toISOString(),
            seedId: s.id,
            route,
            method,
            severity: s.severity || 'minor',
          };
          this.logger.appendActivation(entry);
          // throw an error that is identifiable as seeded
          throw new HttpException(`SEED_ID:${s.id}:${s.message || 'seeded error'}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      return next.handle();
    } catch (err) {
      throw err;
    }
  }
}
