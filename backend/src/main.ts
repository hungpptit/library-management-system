import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './users/user.entity';

async function ensureUsersSchema(dataSource: DataSource) {
  await dataSource.query(`
    DECLARE @usersStatusConstraint SYSNAME;
    DECLARE @usersStatusSql NVARCHAR(MAX);

    IF COL_LENGTH('dbo.Users', 'status') IS NULL
    BEGIN
      ALTER TABLE dbo.Users
      ADD status NVARCHAR(10) NOT NULL CONSTRAINT DF_Users_status DEFAULT 'active';
    END

    IF COL_LENGTH('dbo.Users', 'card_expiry') IS NULL
    BEGIN
      ALTER TABLE dbo.Users
      ADD card_expiry BIGINT NULL;
    END

    UPDATE dbo.Users
    SET status = 'active'
    WHERE LOWER(status) = 'expired';

    SELECT @usersStatusConstraint = cc.name
    FROM sys.check_constraints cc
    INNER JOIN sys.columns c
      ON c.object_id = cc.parent_object_id
      AND c.column_id = cc.parent_column_id
    WHERE cc.parent_object_id = OBJECT_ID('dbo.Users')
      AND c.name = 'status';

    IF @usersStatusConstraint IS NOT NULL
    BEGIN
      SET @usersStatusSql = N'ALTER TABLE dbo.Users DROP CONSTRAINT ' + QUOTENAME(@usersStatusConstraint);
      EXEC sp_executesql @usersStatusSql;
    END

    ALTER TABLE dbo.Users WITH NOCHECK
    ADD CONSTRAINT CK_Users_status
    CHECK (status IN ('active', 'deleted'));
  `);

  await dataSource.query(`
    UPDATE dbo.Users
    SET card_expiry = created_at + 31536000000
    WHERE card_expiry IS NULL;
  `);
}

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
    CHECK (status IN ('Pending', 'Borrowing', 'Returned', 'Overdue', 'Lost', 'Damaged', 'Cancelled'));
  `);

  await dataSource.query(`
    IF OBJECT_ID('dbo.TRG_UpdateAvailable_OnBorrow', 'TR') IS NOT NULL
      DROP TRIGGER dbo.TRG_UpdateAvailable_OnBorrow;

    IF OBJECT_ID('dbo.TRG_UpdateAvailable_OnBorrowApproval', 'TR') IS NOT NULL
      DROP TRIGGER dbo.TRG_UpdateAvailable_OnBorrowApproval;

    EXEC('CREATE TRIGGER TRG_UpdateAvailable_OnBorrow
    ON dbo.Loans
    AFTER INSERT
    AS
    BEGIN
      SET NOCOUNT ON;
      UPDATE Books
      SET available = available - 1
      FROM dbo.Books AS Books
      INNER JOIN inserted ON Books.id = inserted.book_id
      WHERE inserted.status = ''Borrowing'';
    END');

    EXEC('CREATE TRIGGER TRG_UpdateAvailable_OnBorrowApproval
    ON dbo.Loans
    AFTER UPDATE
    AS
    BEGIN
      SET NOCOUNT ON;
      IF UPDATE(status)
      BEGIN
        UPDATE Books
        SET available = available - 1
        FROM dbo.Books AS Books
        INNER JOIN inserted ON Books.id = inserted.book_id
        INNER JOIN deleted ON deleted.id = inserted.id
        WHERE inserted.status = ''Borrowing''
          AND deleted.status = ''Pending'';

        UPDATE Books
        SET available = available + 1
        FROM dbo.Books AS Books
        INNER JOIN inserted ON Books.id = inserted.book_id
        INNER JOIN deleted ON deleted.id = inserted.id
        WHERE inserted.status = ''Returned''
          AND inserted.return_condition = ''Clean''
          AND deleted.status IN (''Borrowing'', ''Overdue'');

        UPDATE Books
        SET quantity = quantity - 1
        FROM dbo.Books AS Books
        INNER JOIN inserted ON Books.id = inserted.book_id
        INNER JOIN deleted ON deleted.id = inserted.id
        WHERE inserted.status = ''Lost''
          AND deleted.status IN (''Borrowing'', ''Overdue'');
      END
    END');
  `);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Specify dynamic origin or localhost for credentials
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  try {
    const dbType = process.env.DB_TYPE || 'mssql';
    if (dbType === 'mssql') {
      const dataSource = app.get(DataSource);
      await ensureUsersSchema(dataSource);
      await ensureLoansSchema(dataSource);
    }
  } catch (error) {
    console.error('Failed to auto-fix schema:', error);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
