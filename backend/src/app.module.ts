import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BooksModule } from './books/books.module';
import { LoansModule } from './loans/loans.module';
// Seed errors (test-only)
let SeedModule: any = undefined;
if (process.env.SEED_ERRORS === 'true') {
  // Lazy require so production without the module is unaffected
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SeedModule = require('./seed/seed.module').SeedModule;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: '12345',
      database: 'LMS',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      options: {
        encrypt: false, // Set to true if using Azure SQL
      },
    }),
    UsersModule,
    BooksModule,
    LoansModule,
    ...(SeedModule ? [SeedModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
