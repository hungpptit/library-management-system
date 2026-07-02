# KẾ HOẠCH VÀ KỊCH BẢN KIỂM THỬ TÍCH HỢP API (API INTEGRATION TEST PLAN)
**Dự án:** Hệ thống Quản lý Thư viện
**Công cụ kiểm thử:** Thunder Client (VS Code Extension)
**Phương pháp:** Black-box Testing (Validation) & Gray-box Testing (Database Constraints)

---

## 1. MỤC ĐÍCH & PHẠM VI (PURPOSE & SCOPE)
Tài liệu này định nghĩa kịch bản kiểm thử tự động cho 9 API cốt lõi được định nghĩa tại Bảng 35. Đảm bảo:
1. Xác thực luồng trả về (Status Code 200/201) cho dữ liệu hợp lệ.
2. Kiểm thử ngoại lệ (Status Code 400) cho dữ liệu vi phạm nghiệp vụ.
3. Xác minh tính vẹn toàn dữ liệu dưới hệ quản trị CSDL (Soft delete, Trigger).

## 2. MÔI TRƯỜNG KIỂM THỬ
* **Base URL:** `http://localhost:3001/api` (Sử dụng biến `{{baseUrl}}`).
* **Backend Port:** `3001` (NestJS với global prefix `/api`).
* **Tài khoản kiểm thử:**
  * **Admin:** `admin@library.com` / `123`
  * **Reader:** `student@university.edu` / `123`
  * **Reader (fallback):** `phong@gmail.com` / `123`
* **Test Data yêu cầu có sẵn:** Tối thiểu 1 độc giả (role: reader) đang có 5 phiếu mượn active, 1 phiếu mượn đang ở trạng thái Borrowing.

---

## 3. KỊCH BẢN KIỂM THỬ CHI TIẾT (THUNDER CLIENT)

*(Tạo Collection "Library API Test" và thêm 9 Request dưới đây. Cấu hình tại tab **"Tests"** của từng Request)*

### API-001. Tìm kiếm sách (Positive)
* **Method & Endpoint:** `GET {{baseUrl}}/books/search?keyword=Gatsby`
* **Mục tiêu:** Trả về danh sách sách khớp từ khóa (tìm theo title, isbn, description).
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `200`
  * `ResBody` | `Contains` | `Gatsby`

### API-002. Đăng ký mượn sách (Negative - Vượt quá hạn ngạch)
* **Method & Endpoint:** `POST {{baseUrl}}/loans/borrow`
* **Body:** `{"userId": 1, "bookId": 1, "dueDate": 1750000000000}`
* **Mục tiêu:** Kiểm tra ràng buộc mượn tối đa 5 phiếu mượn active (Pending + Borrowing + Overdue) trên mỗi độc giả.
* **Điều kiện tiên quyết:** Độc giả ID 1 phải đang có đủ 5 phiếu mượn active trong CSDL.
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `400`
  * `ResBody` | `Contains` | `giới hạn`

### API-003. Xử lý trả sách (Positive & Gray-box)
* **Method & Endpoint:** `PUT {{baseUrl}}/loans/{loanId}/return`
* **Body:** *(Không cần - Server tự xử lý)*
* **Mục tiêu:** Hoàn tất phiếu mượn, server tự gán `return_date`, `status = Returned`, `return_condition = Clean`.
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `200`
  * `ResBody` | `Contains` | `Returned`
* **Gray-box Check:** Mở CSDL, kiểm tra phiếu mượn đã đóng (`status = 'Returned'`), và Trigger `TRG_UpdateAvailable_OnBorrowApproval` đã cộng lại `available` trong bảng `Books`.

### API-004. Thêm sách mới (Positive)
* **Method & Endpoint:** `POST {{baseUrl}}/books`
* **Body:**
```json
{
  "title": "Head First Design Patterns",
  "isbn": "978-0596007126",
  "author": "Eric Freeman",
  "genre": "Programming",
  "publisher": "O'Reilly Media",
  "quantity": 3,
  "price": 45.99,
  "year": 2004,
  "location": "Shelf P-01"
}
```
* **Mục tiêu:** Tạo mới đầu sách, hệ thống tự tạo Author/Publisher/Category nếu chưa tồn tại (Find or Create).
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `201`
  * `ResBody` | `Contains` | `Head First Design Patterns`

### API-005. Cập nhật thông tin sách (Positive)
* **Method & Endpoint:** `PUT {{baseUrl}}/books/{bookId}`
* **Body:**
```json
{
  "title": "Clean Architecture (Updated Edition)",
  "isbn": "978-0134494166",
  "price": 39.99
}
```
* **Mục tiêu:** Chỉnh sửa thông tin sách thành công (title, isbn, price...).
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `200`
  * `ResBody` | `Contains` | `Updated Edition`

### API-006. Xóa mềm sách (Gray-box & Data Integrity)
* **Method & Endpoint:** `DELETE {{baseUrl}}/books/{bookId}`
* **Mục tiêu:** Xóa mềm sách (Soft Delete) mà không ảnh hưởng lịch sử mượn trả cũ.
* **Điều kiện tiên quyết:** Sách không có phiếu mượn active (Pending/Borrowing/Overdue), nếu có sẽ bị chặn với mã 400.
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `200`
* **Gray-box Check (Bắt buộc):** Query SQL Server: `SELECT id, title, deleted_at FROM Books WHERE id = {bookId}`. Xác nhận dòng dữ liệu **không bị xóa vật lý**, mà trường `deleted_at` được cập nhật thời gian xóa (khác `NULL`). Sử dụng TypeORM `@DeleteDateColumn` + `softDelete()`.

### API-007. Lấy danh sách độc giả (Positive)
* **Method & Endpoint:** `GET {{baseUrl}}/users`
* **Mục tiêu:** Lấy danh sách tất cả users có `status = 'active'`, sắp xếp theo `id ASC`.
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `200`
  * `ResBody` | `Contains` | `email`

### API-008. Cập nhật hồ sơ độc giả (Negative - Dữ liệu không hợp lệ)
* **Method & Endpoint:** `PUT {{baseUrl}}/users/{userId}`
* **Body:** `{"status": "invalid_status_value"}`
* **Mục tiêu:** Kiểm tra server validate giá trị `status` (chỉ chấp nhận `active` hoặc `deleted`).
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `400`
  * `ResBody` | `Contains` | `Status must be active or deleted`

### API-009. Vô hiệu hóa tài khoản độc giả - Soft Delete (Positive)
* **Method & Endpoint:** `PUT {{baseUrl}}/users/{userId}`
* **Body:** `{"status": "deleted"}`
* **Mục tiêu:** Đổi trạng thái tài khoản sang `deleted` (vô hiệu hóa mềm), user sẽ không xuất hiện trong danh sách active.
* **Cấu hình tự động:**
  * `ResCode` | `Equal` | `200`
  * `ResBody` | `Contains` | `deleted`
* **Gray-box Check:** Kiểm tra CSDL bảng `Users`, trường `status` của user đã đổi thành `deleted`. User không còn hiện trong `GET /api/users`.

---

## 4. BÁO CÁO KẾT QUẢ
1. **Thực thi:** Tại Collection `Library API Test` > Click dấu `...` > Chọn **Run** > **Run All**.
2. **Minh chứng nộp Trưởng nhóm:**
   * Hình ảnh: Chụp màn hình bảng thống kê Test Results xanh/đỏ từ Thunder Client.
   * File Data: Export collection thành file `.json`.