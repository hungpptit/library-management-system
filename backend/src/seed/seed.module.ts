import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { SeedService } from './seed.service';
import { LoggingService } from './logging.service';
import { SeedInterceptor } from './seed.interceptor';
import { SeedExceptionFilter } from './seed.exception.filter';

@Module({
  providers: [
    SeedService,
    LoggingService,
    { provide: APP_INTERCEPTOR, useClass: SeedInterceptor },
    { provide: APP_FILTER, useClass: SeedExceptionFilter },
  ],
  exports: [SeedService, LoggingService],
})
export class SeedModule {}
