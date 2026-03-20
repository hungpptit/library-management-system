-- Tạo database (chạy câu lệnh này trước nếu chưa có DB)
-- CREATE DATABASE LibraryDB;
-- GO
-- USE LibraryDB;
-- GO

-- Xóa bảng cũ nếu tồn tại để reset dữ liệu
IF OBJECT_ID('dbo.Loans', 'U') IS NOT NULL DROP TABLE dbo.Loans;
IF OBJECT_ID('dbo.Books', 'U') IS NOT NULL DROP TABLE dbo.Books;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-----------------------------------------------------------
-- 1. Bảng Users (Người dùng)
-----------------------------------------------------------
CREATE TABLE Users (
    uid NVARCHAR(50) PRIMARY KEY,          -- Khóa chính: User ID
    email NVARCHAR(100) NOT NULL UNIQUE,   -- Email (duy nhất)
    display_name NVARCHAR(100) NOT NULL,   -- Tên hiển thị
    student_id NVARCHAR(50),               -- Mã số sinh viên/nhân viên
    role NVARCHAR(20) CHECK (role IN ('admin', 'reader')), -- Vai trò: admin hoặc reader
    password NVARCHAR(255) NOT NULL,       -- Mật khẩu
    created_at BIGINT NOT NULL             -- Thời gian tạo (lưu dạng timestamp miliseconds)
);
GO

-----------------------------------------------------------
-- 2. Bảng Books (Sách)
-----------------------------------------------------------
CREATE TABLE Books (
    id NVARCHAR(50) PRIMARY KEY,           -- Khóa chính: Book ID
    title NVARCHAR(255) NOT NULL,          -- Tựa sách
    author NVARCHAR(100) NOT NULL,         -- Tác giả
    isbn NVARCHAR(20),                     -- Mã ISBN
    quantity INT DEFAULT 0,                -- Tổng số lượng
    available INT DEFAULT 0,               -- Số lượng còn lại
    cover_url NVARCHAR(500),               -- URL ảnh bìa
    genre NVARCHAR(50),                    -- Thể loại
    description NVARCHAR(MAX),             -- Mô tả nội dung
    status NVARCHAR(20) DEFAULT 'Available', -- Trạng thái: Available/Unavailable
    year INT,                              -- Năm xuất bản
    publisher NVARCHAR(100),               -- Nhà xuất bản
    price DECIMAL(10, 2),                  -- Giá tiền
    location NVARCHAR(50),                 -- Vị trí trên kệ
    created_at BIGINT NOT NULL             -- Thời gian tạo
);
GO

-----------------------------------------------------------
-- 3. Bảng Loans (Mượn trả)
-----------------------------------------------------------
CREATE TABLE Loans (
    id NVARCHAR(50) PRIMARY KEY,           -- Khóa chính: Loan ID
    
    book_id NVARCHAR(50) NOT NULL,         -- Khóa ngoại tham chiếu Books
    book_title NVARCHAR(255),              -- Lưu tên sách tại thời điểm mượn (để tiện tra cứu)
    
    reader_id NVARCHAR(50) NOT NULL,       -- Khóa ngoại tham chiếu Users
    reader_name NVARCHAR(100),             -- Lưu tên người mượn
    
    issue_date BIGINT NOT NULL,            -- Ngày mượn (timestamp)
    due_date BIGINT NOT NULL,              -- Hạn trả (timestamp)
    return_date BIGINT NULL,               -- Ngày trả thực tế (NULL nếu chưa trả)
    
    status NVARCHAR(20) CHECK (status IN ('Borrowing', 'Returned', 'Overdue')), -- Trạng thái
    fee DECIMAL(10, 2) DEFAULT 0,          -- Phí phạt
    
    -- Định nghĩa Khóa Ngoại (Foreign Keys)
    CONSTRAINT FK_Loans_Books FOREIGN KEY (book_id) REFERENCES Books(id) ON DELETE CASCADE,
    CONSTRAINT FK_Loans_Users FOREIGN KEY (reader_id) REFERENCES Users(uid) ON DELETE CASCADE
);
GO

-----------------------------------------------------------
-- SEED DATA (Dữ liệu mẫu)
-----------------------------------------------------------

-- 1. Insert Users
INSERT INTO Users (uid, email, display_name, student_id, role, password, created_at)
VALUES 
('admin123', 'admin@library.com', 'Librarian Admin', 'ADM-001', 'admin', '123', 1710000000000),
('reader123', 'student@university.edu', 'John Doe', 'STU-2024-001', 'reader', '123', 1710000000000);
GO

-- 2. Insert Books
INSERT INTO Books (id, title, author, isbn, quantity, available, cover_url, genre, description, status, year, publisher, price, location, created_at)
VALUES
('1', 'The Great Gatsby', 'F. Scott Fitzgerald', '978-0743273565', 5, 4, 'https://picsum.photos/seed/gatsby/300/400', 'Classic', 'A story of wealth, love, and the American Dream.', 'Available', 1925, 'Charles Scribner''s Sons', 15.99, 'Shelf A-12', 1710000000000),
('2', '1984', 'George Orwell', '978-0451524935', 3, 2, 'https://picsum.photos/seed/1984/300/400', 'Dystopian', 'A chilling vision of a totalitarian future.', 'Available', 1949, 'Secker & Warburg', 12.50, 'Shelf B-05', 1710000000000),
('3', 'To Kill a Mockingbird', 'Harper Lee', '978-0446310789', 4, 4, 'https://picsum.photos/seed/mockingbird/300/400', 'Fiction', 'A novel about racial injustice and the loss of innocence.', 'Available', 1960, 'J.B. Lippincott & Co.', 14.95, 'Shelf C-01', 1710000000000),
('4', 'The Hobbit', 'J.R.R. Tolkien', '978-0547928227', 6, 6, 'https://picsum.photos/seed/hobbit/300/400', 'Fantasy', 'A fantasy novel about the adventures of Bilbo Baggins.', 'Available', 1937, 'George Allen & Unwin', 18.00, 'Shelf F-08', 1710000000000),
('5', 'Pride and Prejudice', 'Jane Austen', '978-0141439418', 2, 1, 'https://picsum.photos/seed/pride/300/400', 'Romance', 'A romantic novel of manners.', 'Available', 1813, 'T. Egerton', 10.99, 'Shelf R-02', 1710000000000),
('6', 'The Catcher in the Rye', 'J.D. Salinger', '978-0316769488', 3, 3, 'https://picsum.photos/seed/catcher/300/400', 'Fiction', 'A story about teenage angst and alienation.', 'Available', 1951, 'Little, Brown and Company', 13.25, 'Shelf F-15', 1710000000000),
('7', 'The Alchemist', 'Paulo Coelho', '978-0062315007', 10, 10, 'https://picsum.photos/seed/alchemist/300/400', 'Adventure', 'A fable about following your dreams.', 'Available', 1988, 'HarperCollins', 16.50, 'Shelf A-03', 1710000000000),
('8', 'Brave New World', 'Aldous Huxley', '978-0060850524', 4, 4, 'https://picsum.photos/seed/brave/300/400', 'Dystopian', 'A searching vision of an unequal, technologically-advanced future.', 'Available', 1932, 'Chatto & Windus', 14.00, 'Shelf B-07', 1710000000000),
('9', 'The Lord of the Rings', 'J.R.R. Tolkien', '978-0544003415', 2, 2, 'https://picsum.photos/seed/lotr/300/400', 'Fantasy', 'The epic saga of the War of the Ring.', 'Available', 1954, 'George Allen & Unwin', 25.00, 'Shelf F-09', 1710000000000),
('10', 'Frankenstein', 'Mary Shelley', '978-0141439470', 3, 3, 'https://picsum.photos/seed/frankenstein/300/400', 'Horror', 'The story of Victor Frankenstein and his monstrous creation.', 'Available', 1818, 'Lackington, Hughes, Harding, Mavor & Jones', 11.50, 'Shelf H-01', 1710000000000);
GO

-- 3. Insert Loans
INSERT INTO Loans (id, book_id, book_title, reader_id, reader_name, issue_date, due_date, return_date, status, fee)
VALUES
('loan1', '1', 'The Great Gatsby', 'reader123', 'John Doe', 1710500000000, 1711709600000, NULL, 'Borrowing', 0),
('loan2', '2', '1984', 'reader123', 'John Doe', 1709636000000, 1710845600000, NULL, 'Overdue', 5.5),
('loan3', '5', 'Pride and Prejudice', 'reader123', 'John Doe', 1709204000000, 1710413600000, 1710327200000, 'Returned', 0);
GO

PRINT 'Database setup completed successfully.';
