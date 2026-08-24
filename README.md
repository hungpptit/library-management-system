# 📚 Hệ Thống Quản Lý Thư Viện (Library Management System - LMS)

[![NestJS](https://img.shields.io/badge/Backend-NestJS%20v10-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TypeORM](https://img.shields.io/badge/ORM-TypeORM%20v0.3-FE0803?style=flat&logo=typeorm&logoColor=white)](https://typeorm.io/)
[![Database](https://img.shields.io/badge/Database-MSSQL%20%7C%20PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Jest Tests](https://img.shields.io/badge/Tests-95%20Passed%20(100%25)-brightgreen?style=flat&logo=jest&logoColor=white)](https://jestjs.io/)
[![Code Coverage](https://img.shields.io/badge/Coverage-80.6%25%20Overall%20%7C%2099%25%20Users-success?style=flat)]()
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20HttpOnly%20%2B%20RBAC-blue?style=flat)]()

Hệ thống Quản lý Thư viện (LMS) được thiết kế và xây dựng theo chuẩn **Enterprise Modular Architecture** với **NestJS**, **TypeScript** và **TypeORM**. Hệ thống giải quyết trọn vẹn các bài toán nghiệp vụ phức tạp: Quản lý vòng đời mượn - trả sách (State Machine), hàng đợi duyệt ưu tiên (FIFO Queue), kiểm soát hạn ngạch và hạn thẻ độc giả, tính toán phạt vi phạm theo ngày và điều kiện sách, đảm bảo tính toàn vẹn dữ liệu với **Database Transactions (ACID)** và **Soft Delete**.

---

## 🏛️ 1. Kiến Trúc Hệ Thống (System Architecture)

```
[ Client Applications (React Web / Mobile / Thunder Client) ]
                             │
                             ▼  (HTTP / REST APIs + Credentials)
┌────────────────────────────────────────────────────────────────────────┐
│                        NESTJS BACKEND GATEWAY                          │
│                                                                        │
│  [ Global Prefix: /api ]                                               │
│  [ Global ValidationPipe (whitelist: true, transform: true) ]           │
│  [ Dual-Source AuthGuard: HttpOnly Cookies + Bearer Header ]           │
│  [ RBAC RolesGuard: @Roles('admin') / @Roles('reader') ]               │
├────────────────────────────────────────────────────────────────────────┤
│                           CONTROLLER LAYER                             │
│       UsersController   │   BooksController   │   LoansController      │
├────────────────────────────────────────────────────────────────────────┤
│                        SERVICE & BUSINESS LOGIC                        │
│   • FIFO Queue Processor           • Find-or-Create Relational Engine │
│   • Penalty Calculation Engine     • Active Quota Validator (Max 5)   │
│   • Soft-Delete Guard Validator    • Overdue & Card Expiry Sync Engine│
├────────────────────────────────────────────────────────────────────────┤
│                     DATA ACCESS LAYER (TypeORM)                        │
│   • ACID Database Transactions (manager.transaction)                   │
│   • Soft-Delete Columns (@DeleteDateColumn, status='deleted')          │
│   • Entity Repositories: User, Book, Author, Publisher, Category, Loan │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    [ MS SQL Server (Local Dev) ]         [ PostgreSQL (Cloud Production) ]
```

---

## 🌟 2. Điểm Nhấn Kỹ Thuật (Senior Backend Highlights)

### 🔒 1. Giao dịch CSDL nguyên tử (ACID Transactions)
Các luồng nghiệp vụ phức tạp như **Trả sách (`confirmReturnClean`)** và **Báo hỏng/Mất sách (`reportDamageOrLoss`)** được bọc hoàn toàn trong `this.dataSource.transaction()`. Hệ thống thực hiện đồng thời việc tạo nhật ký phạt `FineLog`, chuyển trạng thái `Loan`, và cập nhật tồn kho `Book` trong một transaction duy nhất, đảm bảo tự động **Rollback** nếu có sự cố mạng hoặc lỗi runtime.

### ⏱️ 2. Hàng đợi duyệt mượn theo thứ tự ưu tiên (FIFO Queue)
Khi một đầu sách có số lượng giới hạn và có nhiều độc giả cùng đặt mượn, hệ thống bắt buộc thủ thư phải duyệt yêu cầu của người gửi sớm nhất trước (FIFO Enforcement). Đồng thời, API tự động tính toán thứ hạng chờ thời gian thực (`queue_position`) cho từng độc giả.

### 🛡️ 3. Bảo vệ dữ liệu với cơ chế Soft Delete thông minh
Áp dụng cơ chế **Soft Delete** (`@DeleteDateColumn`, `status = 'deleted'`) cho cả Sách và Độc giả. Khi xóa một thực thể, hệ thống sẽ kiểm tra toàn bộ lịch sử giao dịch: nếu độc giả hoặc sách đang có phiếu mượn active (`Pending`, `Borrowing`, `Overdue`), hệ thống sẽ ném lỗi `BadRequestException` để ngăn chặn việc thất thoát tài sản thư viện.

### 🔐 4. Xác thực kép & Phân quyền RBAC (Role-Based Access Control)
- **Hybrid Token Extraction:** Hỗ trợ trích xuất JWT token linh hoạt từ cả Cookie `httpOnly` (chống tấn công XSS) và Header `Authorization: Bearer <token>` (phục vụ Mobile/Postman testing).
- **Phân quyền chặt chẽ:** Sử dụng Reflector metadata `@Roles('admin')` và `RolesGuard` để bảo vệ các endpoints nhạy cảm.

### 🧹 5. Tự động hóa quan hệ (Find-or-Create Relational Engine)
Khi thêm sách mới, hệ thống tự động kiểm tra sự tồn tại của Tác giả (`Author`), Nhà xuất bản (`Publisher`), và Thể loại (`Category`). Nếu chưa có trong hệ thống, TypeORM sẽ tự động khởi tạo và liên kết khóa ngoại chỉ trong một API call duy nhất.

---

## 🧪 3. Kiểm Thử Tự Động & Độ Bao Phủ Mã Nguồn (Automated Testing & QA)

Dự án được xây dựng với văn hóa **Test-Driven / High-Coverage Testing**, tích hợp trọn bộ **8 Test Suites với 95 Test Cases** bao phủ từ tầng Controller, Service đến Guards và DTOs.

```
Test Suites: 8 passed, 8 total
Tests:       95 passed, 95 total
Snapshots:   0 total
Time:        ~15.2 s
```

### 📊 Bảng đo lường Code Coverage (Jest)

| Phân hệ / Module | Statements | Branch | Functions | Lines | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Users Service** | **99.02%** | **92.22%** | **100%** | **98.98%** | ✅ Hoàn hảo |
| **Users Controller & DTOs** | **100%** | **100%** | **100%** | **100%** | ✅ Hoàn hảo |
| **Loans Service (Transactions & Rules)** | **87.36%** | **68.96%** | **100%** | **87.15%** | ✅ Chuẩn cao |
| **Loans Controller & DTOs** | **100%** | **100%** | **100%** | **100%** | ✅ Hoàn hảo |
| **Books Service & Search Engine** | **84.90%** | **67.27%** | **100%** | **84.15%** | ✅ Chuẩn cao |
| **Books Controller & DTOs** | **93.75%** | **100%** | **100%** | **93.33%** | ✅ Chuẩn cao |
| **Security Guards (AuthGuard & RolesGuard)** | **100%** | **100%** | **100%** | **100%** | ✅ Hoàn hảo |
| **Toàn bộ hệ thống (All Files)** | **79.73%** | **69.81%** | **74.54%** | **80.56%** | ✅ **Passed All** |

> Báo cáo chi tiết xem tại: [`TEST_REPORT.md`](file:///d:/He%20Thong%20Quan%20Li%20Thu%20Vien/TEST_REPORT.md) và file log [`test-results.log`](file:///d:/He%20Thong%20Quan%20Li%20Thu%20Vien/test-results.log).

---

## 📂 4. Cấu Trúc Mã Nguồn (Project Structure)

```
├── backend/                         # Backend NestJS Application
│   ├── src/
│   │   ├── common/                  # Guards, Decorators & Shared Utilities
│   │   │   ├── decorators/          # @Roles() decorator
│   │   │   └── guards/              # AuthGuard, RolesGuard (100% tested)
│   │   ├── books/                   # Books Module (Catalog & Search Engine)
│   │   │   ├── dto/                 # CreateBookDto, UpdateBookDto
│   │   │   ├── author.entity.ts     # Author Entity
│   │   │   ├── book.entity.ts       # Book Entity (SoftDelete & ManyToMany)
│   │   │   ├── category.entity.ts   # Category Entity
│   │   │   ├── publisher.entity.ts  # Publisher Entity
│   │   │   ├── books.controller.ts  # REST Endpoints
│   │   │   └── books.service.ts     # Business Logic
│   │   ├── loans/                   # Loans Module (Transactions, FIFO, Fines)
│   │   │   ├── dto/                 # BorrowLoanDto, ReportDamageDto, CreateLoanDto
│   │   │   ├── loan.entity.ts       # Loan Entity (State Machine)
│   │   │   ├── finelog.entity.ts    # FineLog Entity
│   │   │   ├── loans.controller.ts  # REST Endpoints
│   │   │   └── loans.service.ts     # Core Transactions & Rules
│   │   ├── users/                   # Users & Authentication Module
│   │   │   ├── dto/                 # CreateUserDto, LoginUserDto, UpdateUserDto
│   │   │   ├── user.entity.ts       # User Entity (Bcrypt, Role, Card Expiry)
│   │   │   ├── users.controller.ts  # Login, Register, Profile, Cookie APIs
│   │   │   └── users.service.ts     # Auth & Soft-delete Logic
│   │   ├── app.module.ts            # Root Module & TypeORM DB Config
│   │   └── main.ts                  # Bootstrap, CORS, ValidationPipe, Schema Fix
│   ├── run-test-runner.js           # Automated Test & Coverage Logger
│   └── package.json
├── frontend/                        # Frontend Application (React + Vite + TypeScript)
├── init_db.sql                      # SQL Server Schema & Seed Data
├── package.json                     # Monorepo Workspace Manager
├── TEST_REPORT.md                   # Báo cáo Kiểm thử & Tối ưu hóa Toàn diện
└── test-results.log                 # File log kết quả kiểm thử tự động
```

---

## 🚀 5. Hướng Dẫn Cài Đặt & Chạy Hệ Thống

### 5.1 Yêu cầu môi trường
- **Node.js:** `v18.x` hoặc `v20.x` / `v22.x`
- **NPM:** `v9+`
- **Database:** MS SQL Server 2019+ (Local) hoặc PostgreSQL 14+ (Production / Cloud)

### 5.2 Các bước khởi chạy

#### Bước 1: Clone Repository & Cài đặt Dependencies
```bash
git clone <repository-url>
cd "He Thong Quan Li Thu Vien"
npm install
```

#### Bước 2: Cấu hình biến môi trường (`.env`)
Tạo file `backend/.env` từ file mẫu:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=super-secret-production-jwt-key-2026

# Chọn 'mssql' cho Local Dev hoặc 'postgres' cho Cloud DB
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=your_strong_password
DB_DATABASE=LMS
DB_SYNCHRONIZE=false

FRONTEND_URL=http://localhost:3000
```

#### Bước 3: Chạy Kiểm Thử Tự Động (Automated Testing)
```bash
# Chạy toàn bộ 95 test case và xuất file log:
npm run test:backend

# Hoặc từ thư mục backend:
cd backend
npm run test:cov       # In bảng coverage
npm run test:report    # Xuất báo cáo test-results.log
```

#### Bước 4: Khởi chạy Ứng dụng
```bash
# Khởi chạy đồng thời cả Backend và Frontend từ thư mục gốc:
npm run dev:backend    # Backend chạy tại http://localhost:3001
npm run dev:frontend   # Frontend chạy tại http://localhost:3000
```

---

## 📡 6. Danh Sách RESTful API Endpoints

### 🔑 Authentication & Users (`/api/users`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/users` | Public | Đăng ký tài khoản độc giả mới |
| `POST` | `/api/users/login` | Public | Đăng nhập, cấp phát JWT & thiết lập HttpOnly Cookie |
| `POST` | `/api/users/logout` | Public | Đăng xuất, hủy bỏ Cookie phiên làm việc |
| `GET` | `/api/users` | Admin | Lấy danh sách độc giả đang hoạt động (`status = 'active'`) |
| `GET` | `/api/users/:id` | Admin/User | Lấy thông tin chi tiết độc giả |
| `PUT` | `/api/users/:id` | Admin/User | Cập nhật hồ sơ, gia hạn thẻ, vô hiệu hóa tài khoản |
| `DELETE` | `/api/users/:id` | Admin | Xóa mềm độc giả (chặn xóa nếu còn sách đang mượn) |

### 📖 Books Catalog (`/api/books`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/books` | Public | Lấy danh sách sách kèm số lượng yêu cầu chờ (`pending_count`) |
| `GET` | `/api/books/search?keyword=...` | Public | Tìm kiếm sách không phân biệt hoa thường (`title`, `isbn`, `description`) |
| `GET` | `/api/books/isbn/:isbn` | Public | Tìm sách theo mã chuẩn ISBN |
| `GET` | `/api/books/:id` | Public | Chi tiết thông tin sách |
| `POST` | `/api/books` | Admin | Thêm sách mới (Find-or-Create Tác giả, NXB, Thể loại) |
| `PUT` | `/api/books/:id` | Admin | Cập nhật thông tin sách |
| `DELETE` | `/api/books/:id` | Admin | Xóa mềm sách (chặn xóa nếu sách đang có người mượn) |

### 🔄 Loans & Penalty Management (`/api/loans`)
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/loans/borrow` | Reader | Đăng ký mượn sách (Validate hạn ngạch 5 cuốn, hạn thẻ, quá hạn) |
| `GET` | `/api/loans/my-active-loans/:userId` | Reader | Lấy danh sách sách đang mượn kèm vị trí hàng đợi `queue_position` |
| `GET` | `/api/loans/fines/:userId` | Reader | Xem tổng số tiền phạt và chi tiết biên lai phạt vi phạm |
| `GET` | `/api/loans/search/:loanId` | Admin | Tra cứu phiếu mượn phục vụ thủ tục trả sách |
| `POST` | `/api/loans/:id/approve` | Admin | Duyệt phiếu mượn theo đúng thứ tự ưu tiên **FIFO** |
| `POST` | `/api/loans/:id/reject` | Admin | Từ chối yêu cầu mượn, giải phóng sách cho hàng đợi |
| `POST` | `/api/loans/:id/confirm-clean` | Admin | Hoàn tất trả sách sạch sẽ *(Bọc trong Database Transaction)* |
| `POST` | `/api/loans/:id/report-damage` | Admin | Báo cáo hỏng (50%) / Mất sách (150% + trừ kho) *(Bọc Transaction)* |

---

## 🎯 7. Định Hướng Mở Rộng & Khả Năng Mở Rộng (Future Roadmap)

- [ ] **Redis Caching Layer:** Tích hợp Redis để cache kết quả tìm kiếm sách (`GET /api/books/search`) giảm tải truy vấn CSDL.
- [ ] **Background Worker / Cron Jobs:** Lên lịch chạy ngầm bằng `@nestjs/schedule` để tự động quét và chuyển trạng thái `Overdue` vào 00:00 hàng ngày.
- [ ] **Message Queue (BullMQ / RabbitMQ):** Xử lý email thông báo nhắc hạn trả sách tự động cho độc giả.
- [ ] **CI/CD Pipeline:** Tích hợp GitHub Actions tự động chạy `npm run test:backend` trên mỗi Pull Request.

---


