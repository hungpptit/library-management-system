# 📖 BÁO CÁO KỸ THUẬT & HỒ SƠ DỰ ÁN (PROJECT CASE STUDY)
**Dự án:** Hệ thống Quản lý Thư viện (Library Management System - LMS)  
**Vị trí & Vai trò:** Senior Software Engineer / Lead Backend Developer  
**Công nghệ:** Node.js, NestJS, TypeScript, TypeORM, Jest, MS SQL Server / PostgreSQL  

---

## 1. TỔNG QUAN & HIỆU QUẢ DỰ ÁN (OVERVIEW & IMPACT)

### 1.1. Giới thiệu tổng quan
**Hệ thống Quản lý Thư viện (LMS)** là giải pháp phần mềm cấp doanh nghiệp (Enterprise Grade) được phát triển nhằm số hóa và tự động hóa toàn diện quy trình vận hành thư viện trường học/tổ chức. Hệ thống xử lý các bài toán nghiệp vụ phức tạp từ quản lý kho sách đa quan hệ, định danh và cấp quyền độc giả, điều phối luồng mượn - trả theo mô hình máy trạng thái (State Machine), hàng đợi duyệt ưu tiên (FIFO Queue), đến tính toán phạt vi phạm tài chính tự động.

### 1.2. Các chỉ số kỹ thuật & Hiệu quả đạt được (Key Metrics & Impact)
* **Toàn vẹn dữ liệu 100% (Zero Data Inconsistency):** 100% các thao tác cập nhật đa bảng (Phiếu mượn + Kho sách + Biên lai phạt) được bảo vệ bằng **Database Transactions (ACID)**, loại bỏ hoàn toàn nguy cơ lệch kho khi có sự cố hệ thống.
* **Tự động hóa kiểm thử (QA Excellence):** Xây dựng **8 Test Suites với 95 Test Cases tự động**, đạt tỷ lệ **100% Passed** và độ bao phủ mã nguồn nghiệp vụ (Core Business Coverage) trên **85%** (Users Service đạt **98.98%**).
* **Kiểm soát thất thoát tài sản thư viện:** Chặn 100% hành vi xóa vật lý (Hard Delete) đối với sách và độc giả đang có giao dịch hoạt động thông qua cơ chế **Soft Delete có ràng buộc (Guarded Soft Delete)**.
* **Bảo mật kép (Enhanced Security):** Ngăn chặn hoàn toàn lỗ hổng XSS và CSRF nhờ xác thực JWT qua **HttpOnly Cookies** kết hợp phân quyền theo vai trò **RBAC (Role-Based Access Control)**.

---

## 2. BỐI CẢNH & ĐẶT VẤN ĐỀ (CONTEXT & PROBLEM STATEMENT)

### 2.1. Bối cảnh thực tế
Các thư viện truyền thống và hệ thống phần mềm cũ (Legacy Systems) thường gặp khó khăn lớn trong việc đồng bộ hóa dữ liệu thời gian thực giữa thủ thư và độc giả, dẫn đến tình trạng quá tải vào các kỳ thi, sai lệch số lượng sách thực tế và quy trình xử lý phạt thủ công thiếu minh bạch.

### 2.2. Các bài toán kỹ thuật cốt lõi cần giải quyết (Core Technical Challenges)

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                           BÀI TOÁN & THÁCH THỨC KỸ THUẬT CỐT LÕI                          │
├────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ 1. Tranh chấp tài nguyên       │ Nhiều độc giả cùng đặt mượn 1 cuốn sách có số lượng hữu  │
│    (Concurrency & Fairness)    │ hạn. Cần cơ chế xếp hàng công bằng, minh bạch (FIFO).     │
├────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 2. Tính toàn vẹn khi trả/phạt  │ Khi sách bị mất hoặc hỏng, hệ thống phải vừa ghi nhận     │
│    (Data Inconsistency Risk)   │ tiền phạt, vừa đổi trạng thái phiếu, vừa trừ kho vật lý. │
│                                │ Nếu 1 bước lỗi sẽ gây sai lệch sổ sách kế toán và kho.   │
├────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 3. Nguy cơ đứt gãy dữ liệu     │ Xóa một độc giả hoặc cuốn sách trong CSDL sẽ phá vỡ toàn │
│    (Referential Integrity)     │ bộ lịch sử mượn trả và các báo cáo thống kê trước đó.    │
├────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 4. Bảo mật & Xác thực Client   │ Lưu trữ Token ở LocalStorage phía Client tiềm ẩn nguy cơ  │
│    (Security Vulnerabilities)  │ bị đánh cắp bởi mã độc JavaScript (XSS Attacks).         │
└────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 3. MỤC TIÊU & PHẠM VI DỰ ÁN (OBJECTIVES & SCOPE)

### 3.1. Mục tiêu kỹ thuật (Engineering Objectives)
1. **Kiến trúc Module hóa (Modular Architecture):** Thiết kế backend phân tầng rõ ràng (Controller - Service - Repository - Entity) bằng NestJS, dễ bảo trì và mở rộng.
2. **Tuân thủ nguyên tắc ACID:** Mọi giao dịch tài chính và xuất/nhập kho phải được thực thi trọn vẹn hoặc rollback hoàn toàn.
3. **High Testability:** Đạt độ bao phủ kiểm thử cao, kiểm soát chặt chẽ các trường hợp biên (Edge Cases) và ngoại lệ nghiệp vụ (Negative Cases).
4. **Clean Code & Type Safety:** Sử dụng 100% TypeScript với DTOs được validate tự động bằng `class-validator`.

### 3.2. Phạm vi chức năng hệ thống (Functional Scope)

```
                       ┌─────────────────────────────────────┐
                       │   PHẠM VI CHỨC NĂNG HỆ THỐNG (LMS)  │
                       └──────────────────┬──────────────────┘
                                          │
       ┌────────────────────────┬─────────┴──────────────┬────────────────────────┐
       ▼                        ▼                        ▼                        ▼
┌──────────────┐       ┌────────────────┐       ┌─────────────────┐      ┌────────────────┐
│ QUẢN LÝ USER │       │ QUẢN LÝ CATALOG│       │ MƯỢN TRẢ & FIFO │      │ TÍNH PHẠT & KHO│
├──────────────┤       ├────────────────┤       ├─────────────────┤      ├────────────────┤
│• Đăng ký/Login│      │• CRUD Sách     │       │• Hạn ngạch (<=5)│      │• Trả sạch kho  │
│• Bcrypt Hash │       │• Find-or-Create│       │• Hạn thẻ thư viện│     │• Phạt hỏng 50% │
│• Card Expiry │       │  (Author/NXB)  │       │• Chặn nợ quá hạn│      │• Mất sách 150% │
│• Soft Delete │       │• Search ILike  │       │• FIFO Approval  │      │  (Trừ kho vĩnh)│
│• HttpOnly JWT│       │• Check ISBN 409│       │• Queue Position │      │• ACID Transact │
└──────────────┘       └────────────────┘       └─────────────────┘      └────────────────┘
```

---

## 4. TRÁCH NHIỆM & ĐÓNG GÓP KỸ THUẬT CÁ NHÂN (MY ENGINEERING OWNERSHIP)

Với vai trò **Lead Software Engineer & Backend Developer**, tôi chịu trách nhiệm thiết kế kiến trúc, trực tiếp phát triển các module cốt lõi và tối ưu hóa hệ thống:

### 4.1. Thiết kế Kiến trúc & Xây dựng RESTful API
- Thiết kế cấu trúc Monorepo và Module hóa hệ thống: `UsersModule`, `BooksModule`, `LoansModule`.
- Xây dựng hệ thống Data Transfer Objects (DTOs) kết hợp `ValidationPipe` toàn cục, đảm bảo chỉ những dữ liệu hợp lệ mới đi vào tầng nghiệp vụ.
- Thiết kế hệ thống Entity đa quan hệ với TypeORM: `OneToMany`, `ManyToOne`, và `ManyToMany` tự động ánh xạ bảng trung gian (`Book_Authors`).

### 4.2. Triển khai Giao dịch CSDL & Xử lý Tranh chấp (Transactions & ACID)
- Trực tiếp cấu hình và tích hợp `DataSource.transaction()` trong `LoansService`.
- Giải quyết bài toán nguyên tử: Đóng gói việc tính phạt vi phạm `FineLog`, cập nhật trạng thái phiếu mượn `Loan` và thay đổi số lượng kho `Book` trong một transaction duy nhất.

### 4.3. Thiết kế Thuật toán Hàng đợi FIFO & Máy trạng thái (State Machine)
- Thiết kế luồng chuyển đổi trạng thái phiếu mượn chặt chẽ:
  $$\text{Pending} \xrightarrow{\text{Approve (FIFO)}} \text{Borrowing} \xrightarrow{\text{Return}} \text{Returned} \mid \text{Damaged} \mid \text{Lost}$$
- Xây dựng thuật toán kiểm tra FIFO: Bắt buộc thủ thư duyệt yêu cầu có thời gian gửi sớm nhất trước.
- Thuật toán tính toán vị trí chờ thời gian thực (`queue_position`) cho từng độc giả khi có nhiều người cùng đặt mượn 1 cuốn sách.

### 4.4. Xây dựng Kiến trúc Bảo mật Đa lớp (Defense-in-Depth Security)
- Triển khai `AuthGuard` hỗ trợ cơ chế trích xuất Token kép (Dual-Source Token Extraction): Ưu tiên lấy từ Cookie `httpOnly` và hỗ trợ fallback qua `Authorization: Bearer <token>`.
- Triển khai `RolesGuard` kết hợp Custom Decorator `@Roles('admin')` để phân quyền RBAC nghiêm ngặt.
- Loại bỏ hoàn toàn mã bí mật gán cứng, đồng bộ cấu hình qua `process.env.JWT_SECRET`.

### 4.5. Thiết kế & Tự động hóa Kiểm thử (Test Automation Lead)
- Thiết lập hạ tầng kiểm thử tự động với Jest Test Runner và ts-jest.
- Trực tiếp viết **95 Test Cases** bao phủ Unit Tests, Integration Logic Tests, Guard Tests, và Boundary Exception Tests.
- Viết kịch bản tự động xuất file log và tính toán báo cáo Code Coverage [`run-test-runner.js`](file:///d:/He%20Thong%20Quan%20Li%20Thu%20Vien/backend/run-test-runner.js).

---

## 5. KIẾN TRÚC HỆ THỐNG TỔNG THỂ (SYSTEM ARCHITECTURE)

### 5.1. Sơ đồ Kiến trúc Phân tầng (Layered Architecture Diagram)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION & GATEWAY LAYER                        │
│                                                                            │
│   HTTP Request (REST) ──► Global Prefix: /api                              │
│                       ──► ValidationPipe ({ whitelist: true })             │
│                       ──► AuthGuard (JWT Verify from Cookie / Bearer)      │
│                       ──► RolesGuard (Reflector Metadata RBAC)             │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              CONTROLLER LAYER                              │
│                                                                            │
│     UsersController        │     BooksController     │    LoansController   │
│   (Auth, Profiles, CRUD)   │  (Catalog, Search, DTO) │ (Borrow, Return, FIFO)│
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                          SERVICE / DOMAIN LOGIC LAYER                      │
│                                                                            │
│  • UsersService: Bcrypt Hash, Soft-delete Guard, Duplicate Validation      │
│  • BooksService: ILike Search Engine, Relational Find-or-Create Factory    │
│  • LoansService: ACID Transactions, FIFO Queue, Dynamic Penalty Engine     │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     DATA ACCESS LAYER (TypeORM ORM)                        │
│                                                                            │
│  • EntityManager & Transaction Manager (manager.transaction)               │
│  • Repositories: User, Book, Author, Publisher, Category, Loan, FineLog    │
│  • Soft Delete Support: @DeleteDateColumn, status='deleted'                │
└─────────────────────────────────────┬──────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE ENGINES                              │
│                                                                            │
│   [ MS SQL Server 2019+ (Local) ]    │   [ PostgreSQL 14+ (Production) ]   │
│   • Clustered PKs, Indexes           • Connection Pool (SSL enabled)       │
│   • Trigger synchronization          • Cloud Deployment (Neon / Supabase)  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2. Sơ đồ Mô hình Dữ liệu Quan hệ (Entity Relationship Diagram - ERD)

```
┌──────────────┐         1..N ┌──────────────┐
│  Categories  │◄─────────────┤    Books     │
└──────────────┘              └──────┬───────┘
                                     │ 1..N
┌──────────────┐         1..N        │
│  Publishers  │◄────────────────────┤
└──────────────┘                     │
                                     │ N..M (Book_Authors)
┌──────────────┐         N..M        │
│   Authors    │◄────────────────────┤
└──────────────┘                     │
                                     │ 1..N
┌──────────────┐         1..N ┌──────┴───────┐ 1..N ┌──────────────┐
│    Users     │◄─────────────┤    Loans     ├─────►│  Fine_Logs   │
│  (Readers)   │              │(State Machine│      │(Penalty Dtls)│
└──────────────┘              └──────────────┘      └──────────────┘
```

---

### 5.3. Các Design Patterns & Best Practices được áp dụng

1. **Repository Pattern (TypeORM):** Tách biệt hoàn toàn tầng truy vấn dữ liệu khỏi tầng nghiệp vụ, giúp dễ dàng viết mock unit test độc lập với CSDL.
2. **Dependency Injection (NestJS IoC Container):** Quản lý vòng đời và sự phụ thuộc giữa các Services, Guards và Repositories.
3. **Decorator Pattern:** Áp dụng `@Roles('admin')`, `@UseGuards(AuthGuard, RolesGuard)`, `@DeleteDateColumn` để bổ sung hành vi cho hàm một cách linh hoạt.
4. **Factory / Find-or-Create Pattern:** Tự động tạo và liên kết các thực thể danh mục (Tác giả, NXB, Thể loại) khi nhập sách mới.
5. **Unit of Work / Transaction Script Pattern:** Đóng gói toàn bộ các thao tác mượn/trả/phạt vào một Transaction duy nhất để bảo đảm nguyên tắc ACID.

---

## 6. KẾT LUẬN & ĐÁNH GIÁ SẴN SÀNG (PRODUCTION READINESS)

Dự án **Hệ thống Quản lý Thư viện (LMS)** là minh chứng rõ ràng cho năng lực thiết kế kiến trúc phần mềm chuyên sâu, tư duy giải quyết bài toán nghiệp vụ phức tạp, và kỹ năng kiểm thử tự động đạt chuẩn doanh nghiệp:

- ✅ **Chất lượng mã nguồn:** Chuẩn Type-safe, Module hóa cao, tuân thủ nguyên lý SOLID.
- ✅ **Bảo mật & Toàn vẹn:** Không còn mã bí mật gán cứng, bảo vệ 100% bằng Database Transactions.
- ✅ **Kiểm định hoàn tất:** 95/95 test cases đạt chuẩn xanh (PASSED), sẵn sàng triển khai thực tế.
