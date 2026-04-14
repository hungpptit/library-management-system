import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function ensureLoansSchema(dataSource: DataSource) {
  await dataSource.query(`
    IF COL_LENGTH('dbo.Loans', 'return_condition') IS NULL
    BEGIN
      ALTER TABLE dbo.Loans
      ADD return_condition NVARCHAR(255) NULL;
    END
  `);

  await dataSource.query(`
    DECLARE @statusConstraint SYSNAME;
    DECLARE @sql NVARCHAR(MAX);

    SELECT @statusConstraint = cc.name
    FROM sys.check_constraints cc
    INNER JOIN sys.columns c
      ON c.object_id = cc.parent_object_id
      AND c.column_id = cc.parent_column_id
    WHERE cc.parent_object_id = OBJECT_ID('dbo.Loans')
      AND c.name = 'status';

    IF @statusConstraint IS NOT NULL
    BEGIN
      SET @sql = N'ALTER TABLE dbo.Loans DROP CONSTRAINT ' + QUOTENAME(@statusConstraint);
      EXEC sp_executesql @sql;
    END

    ALTER TABLE dbo.Loans WITH NOCHECK
    ADD CONSTRAINT CK_Loans_status
    CHECK (status IN ('Borrowing', 'Returned', 'Overdue', 'Lost', 'Damaged'));
  `);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for frontend communication
  app.enableCors({
    origin: '*', // Allow all origins for development to avoid port mismatch
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  try {
    const dataSource = app.get(DataSource);
    await ensureLoansSchema(dataSource);
  } catch (error) {
    console.error('Failed to auto-fix Loans schema:', error);
  }

  await app.listen(3001);
}
bootstrap();
