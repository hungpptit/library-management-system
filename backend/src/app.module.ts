import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';

const getDbConfig = (): any => {
  const dbType = (process.env.DB_TYPE as any) || 'mssql';
  const isPostgres = dbType === 'postgres';
  
  const config: any = {
    type: dbType,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : (isPostgres ? 5432 : 1433),
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_DATABASE || 'LMS',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
  };

  if (isPostgres) {
    if (process.env.DB_SSL === 'true') {
      config.ssl = { rejectUnauthorized: false };
    }
  } else if (dbType === 'mssql') {
    config.options = {
      encrypt: process.env.DB_ENCRYPT === 'true' || false,
      trustServerCertificate: true,
    };
  }
  return config;
};

@Module({
  imports: [
    TypeOrmModule.forRoot(getDbConfig()),
    UsersModule,
    BooksModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
