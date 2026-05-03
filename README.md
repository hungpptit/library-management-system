# 📚 HỆ THỐNG QUẢN LÝ THƯ VIỆN

## 1. Thông Tin Đề Tài
**Tên đề tài:** Hệ thống Quản lý Thư viện  
**Số lượng thành viên:** 3 sinh viên  
**Trạng thái:** Đang phát triển (v1.0.0)

---

## 2. Mô Tả Dự Án

Ứng dụng web toàn diện để quản lý thư viện, cho phép:
- **Độc giả**: Tìm kiếm, xem chi tiết sách, mượn/trả sách, quản lý thông tin cá nhân
- **Quản trị viên (Thủ thư)**: Quản lý sách, độc giả, phiếu mượn trả, tính phí phạt

### 🎯 Các Yêu Cầu Chính

#### 2.1 Quản lý Mượn Sách (Use Case 1)
- Ghi nhận thông tin mượn sách: Thủ thư lập phiếu mượn bằng Mã độc giả và Mã sách
- Kiểm tra ràng buộc:
  - Kiểm tra thẻ độc giả còn hạn
  - Kiểm tra số lượng sách đang mượn không vượt giới hạn
- Cập nhật trạng thái sách sang **"Đang mượn"** khi lập phiếu thành công

#### 2.2 Quản lý Trả Sách & Tính Phạt (Use Case 2)
- Ghi nhận trả sách: Nhập Mã phiếu mượn hoặc Mã sách
- Tính toán tiền phạt:
  - So sánh ngày trả thực tế với ngày hẹn trả
  - Tính số ngày quá hạn và áp dụng đơn giá phạt
- Cập nhật trạng thái sách về **"Sẵn có"** và lưu lịch sử giao dịch

#### 2.3 Tra Cứu & Quản Lý Danh Mục (Use Case 3)
- Tìm kiếm thông minh: Theo Tên sách, Tác giả, Thể loại, ISBN
- Phân loại: Hiển thị sách theo danh mục chuyên ngành (CNTT, Kinh tế, Ngoại ngữ...)

---

## 3. Các Use Case Chính

| Use Case | Mô Tả | Trạng Thái |
|----------|-------|-----------|
| **Quản lý Sách** | Nhập liệu, phân loại theo chuyên ngành | ✅ |
| **Quản lý Mượn - Trả** | Ghi nhận, tự động chuyển trạng thái | ✅ |
| **Quản lý Độc giả** | Lưu trữ thông tin, kiểm soát số sách mượn | ✅ |
| **Tính phí phạt** | Tự động so sánh ngày trả, xuất hóa đơn | ✅ |

---

## 4. Thành Viên Nhóm

### 👨‍💼 Thành Viên 1: Phạm Tuấn Hưng (Trưởng nhóm)
**Phụ trách:** Tra cứu & Quản lý danh mục Sách

**Phát triển (Dev):**
- Xây dựng chức năng CRUD Sách (Thêm, sửa, xóa, quản lý trạng thái)
- Thiết kế Database cho thực thể `Books` và `Categories`
- Xây dựng công cụ tìm kiếm thông minh

**Kiểm thử (Testing):**
- Lập kế hoạch kiểm thử (**Test Plan**) cho toàn bộ hệ thống
- Thực hiện **Kiểm thử giao diện (UI Testing)**
- Áp dụng kỹ thuật **Phân vùng tương đương** cho chức năng tìm kiếm

### 👩‍💻 Thành Viên 2: Kiều
**Phụ trách:** Quản lý Mượn - Trả & Tính Phí Phạt

**Phát triển (Dev):**
- Xây dựng logic lập phiếu mượn (kiểm tra hạn thẻ, giới hạn số sách)
- Xử lý quy trình trả sách và cập nhật trạng thái kho
- Viết thuật toán tính tiền phạt theo số ngày quá hạn

**Kiểm thử (Testing):**
- Thực hiện **Kiểm thử hộp trắng (Unit Test)** cho hàm tính tiền phạt
- Thiết kế **Bảng quyết định (Decision Table)** cho ràng buộc khi mượn

### 👨‍💻 Thành Viên 3: Quý
**Phụ trách:** Đăng ký & Quản lý Độc giả

**Phát triển (Dev):**
- Xây dựng chức năng đăng ký/đăng nhập, cập nhật thông tin độc giả
- Quản lý thời hạn hiệu lực thẻ độc giả
- Theo dõi lịch sử mượn trả cá nhân

**Kiểm thử (Testing):**
- Thực hiện **Rà soát tài liệu đặc tả (Review SRS)**
- Áp dụng kỹ thuật **Phân tích giá trị biên** cho các trường dữ liệu

---

## 5. Công Nghệ Sử Dụng

### Backend
- **Framework:** NestJS
- **Ngôn ngữ:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **API:** REST API với JWT Authentication

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Ngôn ngữ:** TypeScript
- **Styling:** CSS

### Công Cụ & Môi Trường
- **Runtime:** Node.js v16+
- **Package Manager:** npm v7+
- **Version Control:** Git

---

## 6. Cấu Trúc Dự Án

```
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── books/          # Module quản lý sách
│   │   │   ├── book.entity.ts
│   │   │   ├── author.entity.ts
│   │   │   ├── category.entity.ts
│   │   │   ├── publisher.entity.ts
│   │   │   ├── books.controller.ts
│   │   │   ├── books.service.ts
│   │   │   └── books.module.ts
│   │   ├── loans/          # Module quản lý mượn trả
│   │   │   ├── loan.entity.ts
│   │   │   ├── finelog.entity.ts
│   │   │   ├── loans.controller.ts
│   │   │   ├── loans.service.ts
│   │   │   ├── loans.module.ts
│   │   │   └── dto/
│   │   ├── users/          # Module quản lý người dùng
│   │   │   ├── user.entity.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   ├── common/         # Shared utilities
│   │   ├── main.ts         # Entry point
│   │   └── app.module.ts   # Root module
│   └── package.json
├── frontend/                # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin components
│   │   │   ├── auth/       # Authentication
│   │   │   ├── books/      # Book components
│   │   │   ├── loans/      # Loan components
│   │   │   ├── users/      # User components
│   │   │   ├── common/     # Common components
│   │   │   ├── ui/         # UI components
│   │   │   └── layout/     # Layout components
│   │   ├── contexts/       # React Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types.ts        # TypeScript types
│   │   └── main.tsx        # Entry point
│   └── package.json
├── init_db.sql             # Database schema & seed data
├── package.json            # Root package
└── README.md              # This file
```

---

## 7. Cài Đặt & Chạy Dự Án

### 7.1 Yêu Cầu Hệ Thống
- Node.js v16+ hoặc v18+
- npm v7+
- PostgreSQL 12+ (hoặc Docker)
- Git

### 7.2 Hướng Dẫn Cài Đặt

#### Bước 1: Clone Repository
```bash
git clone <repository-url>
cd "He Thong Quan Li Thu Vien"
```

#### Bước 2: Cài Đặt Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
cd ..
```

#### Bước 3: Cấu Hình Database

**Tạo Database PostgreSQL:**
```bash
createdb library_management
```

**Chạy SQL initialization:**
```bash
psql -U your_username -d library_management -f init_db.sql
```

#### Bước 4: Cấu Hình Environment Variables

**Backend (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=library_management
DB_SYNCHRONIZE=false

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400

PORT=3000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
```

#### Bước 5: Chạy Ứng Dụng

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
# Server chạy tại http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Ứng dụng chạy tại http://localhost:5173
```

---

## 8. API Endpoints

### Authentication
```
POST   /api/auth/register        # Đăng ký tài khoản mới
POST   /api/auth/login           # Đăng nhập
```

### Books
```
GET    /api/books                # Lấy danh sách sách
GET    /api/books/:id            # Chi tiết sách
POST   /api/books                # Thêm sách (Admin)
PUT    /api/books/:id            # Cập nhật sách (Admin)
DELETE /api/books/:id            # Xóa sách (Admin)
```

### Loans
```
GET    /api/loans                # Danh sách mượn trả
GET    /api/loans/:id            # Chi tiết phiếu mượn
POST   /api/loans                # Tạo phiếu mượn
PUT    /api/loans/:id            # Cập nhật (trả sách)
GET    /api/loans/overdue        # Sách quá hạn
```

### Users
```
GET    /api/users                # Danh sách độc giả (Admin)
GET    /api/users/:id            # Chi tiết độc giả
PUT    /api/users/:id            # Cập nhật thông tin
DELETE /api/users/:id            # Xóa độc giả (Admin)
```

---

## 9. Tính Năng Chính

### Cho Độc Giả
✅ Đăng ký, đăng nhập tài khoản  
✅ Tìm kiếm & xem chi tiết sách  
✅ Mượn sách, quản lý phiếu mượn  
✅ Xem lịch sử mượn trả  
✅ Quản lý thông tin cá nhân  

### Cho Quản Trị Viên
✅ Quản lý danh sách sách  
✅ Quản lý độc giả  
✅ Quản lý phiếu mượn trả  
✅ Tính phí phạt quá hạn  
✅ Xem thống kê & báo cáo  

---

## 10. Hướng Dẫn Sử Dụng

### Đăng Nhập
1. Truy cập `http://localhost:5173`
2. Nhập email và mật khẩu
3. Chọn "Đăng Nhập"

### Mượn Sách
1. Tìm sách cần mượn
2. Chọn "Mượn"
3. Chọn ngày trả dự kiến
4. Xác nhận

### Trả Sách
1. Vào danh sách "Sách đang mượn"
2. Chọn "Trả"
3. Xác nhận
4. Hệ thống tính phí phạt nếu quá hạn

---

## 11. Kiểm Thử

### Chạy Test
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### Test Coverage
```bash
cd backend
npm run test:cov
```

---

## 12. Bảo Mật

- ✅ Mật khẩu mã hóa bằng bcrypt
- ✅ JWT token cho authentication
- ✅ CORS được cấu hình
- ✅ Input validation trên backend & frontend
- ✅ SQL injection prevention (TypeORM)

---

## 13. Troubleshooting

### Lỗi kết nối Database
```bash
# Kiểm tra PostgreSQL đang chạy
psql --version

# Kiểm tra thông tin connection
psql -h localhost -U postgres
```

### Port 3000 hoặc 5173 đang được sử dụng
```bash
# Thay đổi port trong .env hoặc vite.config.ts
```

### Dependencies không được install
```bash
npm clean-install  # Thay vì npm install
```

---

## 14. Yêu Cầu Dự Án

### 📌 Yêu Cầu Chung
- Thực hiện đúng tiến độ theo lịch trình
- Hoàn thành các giai đoạn: Rà soát, Kiểm thử, Báo cáo
- Tất cả thành viên:
  - Tham gia xây dựng Test Case
  - Thực hiện kiểm thử thủ công/tự động
  - Hoàn thiện báo cáo tiểu luận cuối kỳ

---

## 15. Liên Hệ & Hỗ Trợ

Nếu bạn có câu hỏi hoặc gợi ý, vui lòng liên hệ nhóm phát triển.

### Báo Cáo Lỗi
Tạo issue với:
- Mô tả chi tiết vấn đề
- Các bước tái tạo
- Screenshots/logs

---

**Phiên bản:** 1.0.0  
**Cập nhật:** Tháng 5, 2026  
**Trạng thái:** Đang phát triển ✨