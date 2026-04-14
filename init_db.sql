-- ==========================================================
-- DATABASE SETUP: LIBRARY MANAGEMENT SYSTEM (LMS)
-- ==========================================================

-- 1. XÓA BẢNG CŨ THEO THỨ TỰ (Bảng con trước, bảng cha sau)
IF OBJECT_ID('dbo.Fine_Logs', 'U') IS NOT NULL DROP TABLE dbo.Fine_Logs;
IF OBJECT_ID('dbo.Book_Authors', 'U') IS NOT NULL DROP TABLE dbo.Book_Authors;
IF OBJECT_ID('dbo.Loans', 'U') IS NOT NULL DROP TABLE dbo.Loans;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Authors', 'U') IS NOT NULL DROP TABLE dbo.Authors;
IF OBJECT_ID('dbo.Publishers', 'U') IS NOT NULL DROP TABLE dbo.Publishers;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-----------------------------------------------------------
-- 2. TẠO CÁC BẢNG DANH MỤC (TABLES WITHOUT FOREIGN KEYS)
-----------------------------------------------------------

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(100) NOT NULL UNIQUE,
    display_name NVARCHAR(100) NOT NULL,
    student_id NVARCHAR(50),
    role NVARCHAR(20) CHECK (role IN ('admin', 'reader')),
    password NVARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    location_area NVARCHAR(50),
    created_at BIGINT NOT NULL
);

CREATE TABLE Publishers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    address NVARCHAR(255),
    phone NVARCHAR(20)
);

CREATE TABLE Authors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    bio NVARCHAR(MAX),
    created_at BIGINT NOT NULL
);
GO

-----------------------------------------------------------
-- 3. TẠO CÁC BẢNG CHÍNH (TABLES WITH FOREIGN KEYS)
-----------------------------------------------------------

CREATE TABLE Books (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    isbn NVARCHAR(20),
    category_id INT FOREIGN KEY REFERENCES Categories(id),
    publisher_id INT FOREIGN KEY REFERENCES Publishers(id),
    quantity INT DEFAULT 0,
    available INT DEFAULT 0,
    price DECIMAL(10, 2),
    description NVARCHAR(MAX),
    cover_url NVARCHAR(500),
    year INT,
    location NVARCHAR(50),
    created_at BIGINT NOT NULL
);

CREATE TABLE Book_Authors (
    book_id INT NOT NULL FOREIGN KEY REFERENCES Books(id) ON DELETE CASCADE,
    author_id INT NOT NULL FOREIGN KEY REFERENCES Authors(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE Loans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    book_id INT NOT NULL FOREIGN KEY REFERENCES Books(id),
    reader_id INT NOT NULL FOREIGN KEY REFERENCES Users(id),
    issue_date BIGINT NOT NULL,
    due_date BIGINT NOT NULL,
    return_date BIGINT NULL,
    return_condition NVARCHAR(255) NULL,
    status NVARCHAR(20) CHECK (status IN ('Borrowing', 'Returned', 'Overdue', 'Lost', 'Damaged'))
);

CREATE TABLE Fine_Logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    loan_id INT NOT NULL FOREIGN KEY REFERENCES Loans(id),
    fine_amount DECIMAL(10, 2),
    reason NVARCHAR(255),
    status NVARCHAR(20) CHECK (status IN ('Pending', 'Paid')),
    created_at BIGINT NOT NULL
);
GO

-----------------------------------------------------------
-- 4. TẠO TRIGGERS (Tự động cập nhật số lượng sách)
-----------------------------------------------------------

CREATE TRIGGER TRG_UpdateAvailable_OnBorrow
ON Loans AFTER INSERT AS
BEGIN
    UPDATE Books SET available = available - 1
    FROM Books INNER JOIN inserted ON Books.id = inserted.book_id
    WHERE inserted.status = 'Borrowing';
END;
GO

CREATE TRIGGER TRG_UpdateAvailable_OnReturn
ON Loans AFTER UPDATE AS
BEGIN
    IF UPDATE(status)
    BEGIN
        -- Trả sách
        UPDATE Books SET available = available + 1
        FROM Books INNER JOIN inserted ON Books.id = inserted.book_id
        INNER JOIN deleted ON deleted.id = inserted.id
                WHERE inserted.status = 'Returned'
                    AND inserted.return_condition = 'Clean'
                    AND deleted.status IN ('Borrowing', 'Overdue');

        -- Mất sách (Trừ kho)
        UPDATE Books SET quantity = quantity - 1
        FROM Books INNER JOIN inserted ON Books.id = inserted.book_id
        INNER JOIN deleted ON deleted.id = inserted.id
        WHERE inserted.status = 'Lost' AND deleted.status IN ('Borrowing', 'Overdue');
    END
END;
GO

-- Add return_condition for existing databases if missing.
IF COL_LENGTH('dbo.Loans', 'return_condition') IS NULL
BEGIN
    ALTER TABLE Loans ADD return_condition NVARCHAR(255) NULL;
END;
GO

-----------------------------------------------------------
-- 5. SEED DATA (Nạp 10 dòng mẫu chuẩn)
-----------------------------------------------------------

-- -- Categories & Publishers
-- INSERT INTO Categories (name, location_area, created_at) VALUES ('Classic', 'A1', 1710000000), ('Dystopian', 'B1', 1710000000), ('Fiction', 'A2', 1710000000), ('Fantasy', 'B2', 1710000000), ('Romance', 'C1', 1710000000), ('Adventure', 'A3', 1710000000), ('Horror', 'B3', 1710000000);
-- INSERT INTO Publishers (name, address, phone) VALUES ('Scribner', 'USA', '123-456'), ('Secker & Warburg', 'UK', '789-012'), ('Lippincott', 'USA', '111-222'), ('Allen & Unwin', 'UK', '333-444'), ('Egerton', 'UK', '555-666'), ('Little, Brown', 'USA', '777-888'), ('HarperCollins', 'USA', '999-000'), ('Chatto & Windus', 'UK', '121-212'), ('Lackington', 'UK', '343-434');
-- INSERT INTO Authors (name, bio, created_at) VALUES ('F. Scott Fitzgerald', 'USA', 1710000000), ('George Orwell', 'UK', 1710000000), ('Harper Lee', 'USA', 1710000000), ('J.R.R. Tolkien', 'UK', 1710000000), ('Jane Austen', 'UK', 1710000000), ('J.D. Salinger', 'USA', 1710000000), ('Paulo Coelho', 'Brazil', 1710000000), ('Aldous Huxley', 'UK', 1710000000), ('Mary Shelley', 'UK', 1710000000);

-- -- Books (ID 1-10)
-- INSERT INTO Books (title, isbn, category_id, publisher_id, quantity, available, price, year, location, cover_url, description, created_at) VALUES
-- ('The Great Gatsby', '9780743273565', 1, 1, 5, 5, 15.99, 1925, 'Shelf A-12', 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', 'A classic American novel about wealth and love.', 1710000000),
-- ('1984', '9780451524935', 2, 2, 3, 3, 12.50, 1949, 'Shelf B-05', 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 'A dystopian nightmare about government surveillance.', 1710000000),
-- ('To Kill a Mockingbird', '9780446310789', 3, 3, 4, 4, 14.95, 1960, 'Shelf C-01', 'https://covers.openlibrary.org/b/isbn/9780446310789-L.jpg', 'A novel about racial injustice and innocence.', 1710000000),
-- ('The Hobbit', '9780547928227', 4, 4, 6, 6, 18.00, 1937, 'Shelf F-08', 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', 'A fantasy adventure to reclaim a treasure.', 1710000000),
-- ('Pride and Prejudice', '9780141439418', 5, 5, 2, 2, 10.99, 1813, 'Shelf R-02', 'https://covers.openlibrary.org/b/isbn/9780141439418-L.jpg', 'A romantic novel about manners and marriage.', 1710000000),
-- ('The Catcher in the Rye', '9780316769488', 3, 6, 3, 3, 13.25, 1951, 'Shelf F-15', 'https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg', 'A story about teenage angst and rebellion.', 1710000000),
-- ('The Alchemist', '9780062315007', 6, 7, 10, 10, 16.50, 1988, 'Shelf A-03', 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', 'A fable about following your dreams.', 1710000000),
-- ('Brave New World', '9780060850524', 2, 8, 4, 4, 14.00, 1932, 'Shelf B-07', 'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg', 'A vision of a technologically advanced future.', 1710000000),
-- ('The Lord of the Rings', '9780544003415', 4, 4, 2, 2, 25.00, 1954, 'Shelf F-09', 'https://covers.openlibrary.org/b/isbn/9780544003415-L.jpg', 'The epic battle between good and evil.', 1710000000),
-- ('Frankenstein', '9780141439470', 7, 9, 3, 3, 11.50, 1818, 'Shelf H-01', 'https://covers.openlibrary.org/b/isbn/9780141439470-L.jpg', 'A scientist creates a monstrous creature.', 1710000000);

-- -- Map Book_Authors
-- INSERT INTO Book_Authors (book_id, author_id) VALUES (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 4), (10, 9);

-- -- Users
-- INSERT INTO Users (email, display_name, role, password, created_at) VALUES ('admin@lib.com', 'Admin Hung', 'admin', '123', 1710000000), ('student@lib.com', 'John Doe', 'reader', '123', 1710000000);

-- -- Loans
-- INSERT INTO Loans (book_id, reader_id, issue_date, due_date, status) VALUES (1, 2, 1710500000, 1711709600, 'Borrowing');
-- GO

PRINT 'Database setup completed successfully.';