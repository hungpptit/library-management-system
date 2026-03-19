# 📚 HỆ THỐNG QUẢN LÝ THƯ VIỆN

## 1. Tên đề tài
**Hệ thống Quản lý Thư viện**

## 2. Số lượng thành viên
3 sinh viên

---

## 3. Mô tả đề tài

### 🎯 Các yêu cầu chính

### 3.1 Quản lý Mượn sách (1 Use Case)

- Ghi nhận thông tin mượn sách: Thủ thư lập phiếu mượn bằng cách nhập Mã độc giả và Mã sách.
- Kiểm tra ràng buộc:
  - Kiểm tra thẻ độc giả còn hạn hay không.
  - Kiểm tra số lượng sách đang mượn không vượt quá giới hạn cho phép.
- Cập nhật kho:
  - Tự động chuyển trạng thái sách sang **"Đang mượn"** khi lập phiếu thành công.

---

### 3.2 Quản lý Trả sách và Tính phạt (1 Use Case)

- Ghi nhận trả sách:
  - Nhập Mã phiếu mượn hoặc Mã sách để thực hiện trả sách.
- Tính toán tiền phạt:
  - So sánh ngày trả thực tế với ngày hẹn trả.
  - Tính số ngày quá hạn và áp dụng đơn giá phạt tương ứng.
- Hoàn tất:
  - Cập nhật trạng thái sách về **"Sẵn có"**.
  - Lưu lịch sử giao dịch.

---

### 3.3 Tra cứu và Quản lý danh mục (1 Use Case)

- Tìm kiếm thông minh:
  - Tìm kiếm theo Tên sách, Tác giả, Thể loại, ISBN.
- Phân loại:
  - Hiển thị sách theo từng danh mục chuyên ngành (CNTT, Kinh tế, Ngoại ngữ,...).

---

## 4. Yêu cầu đối với nhóm và thành viên

### 📌 Yêu cầu chung
- Thực hiện đúng tiến độ theo lịch trình của giảng viên.
- Hoàn thành các giai đoạn: Rà soát, Kiểm thử và Báo cáo.
- Tất cả thành viên:
  - Tham gia xây dựng Test Case.
  - Thực hiện kiểm thử thủ công/tự động.
  - Hoàn thiện báo cáo tiểu luận cuối kỳ.

---

### 👨‍💼 Thành viên 1: Phạm Tuấn Hưng (Trưởng nhóm)
**Phụ trách: Tra cứu & Quản lý danh mục Sách**
* **Phát triển (Dev):**
    * Xây dựng chức năng CRUD Sách (Thêm, sửa, xóa, quản lý trạng thái sách).
    * Thiết kế kiến trúc Database (SQL Server) cho thực thể `Books` và `Categories`.
    * Xây dựng công cụ tìm kiếm thông minh (theo Tên, Tác giả, ISBN, Thể loại).
* **Kiểm thử (Testing):**
    * Lập kế hoạch kiểm thử (**Test Plan**) cho toàn bộ hệ thống.
    * Thực hiện **Kiểm thử giao diện (UI Testing)**.
    * Áp dụng kỹ thuật **Phân vùng tương đương** cho chức năng tìm kiếm.

---

### 👩‍💻 Thành viên 2: Kiều
**Phụ trách: Quản lý Mượn - Trả & Tính phí phạt**
* **Phát triển (Dev):**
    * Xây dựng logic nghiệp vụ lập phiếu mượn (kiểm tra hạn thẻ, giới hạn số sách).
    * Xử lý quy trình trả sách và cập nhật trạng thái kho.
    * Viết thuật toán tính toán tiền phạt dựa trên số ngày quá hạn và đơn giá phạt.
* **Kiểm thử (Testing):**
    * Thực hiện **Kiểm thử hộp trắng (Unit Test)** cho hàm tính tiền phạt.
    * Thiết kế **Bảng quyết định (Decision Table)** để kiểm tra các ràng buộc khi mượn sách.

---

### 👨‍💻 Thành viên 3: Quý
**Phụ trách: Đăng ký & Quản lý Độc giả**
* **Phát triển (Dev):**
    * Xây dựng chức năng đăng ký/đăng nhập và cập nhật thông tin độc giả.
    * Quản lý thời hạn hiệu lực của thẻ độc giả.
    * Theo dõi lịch sử mượn trả cá nhân của từng thành viên.
* **Kiểm thử (Testing):**
    * Thực hiện **Rà soát tài liệu đặc tả (Review SRS)**.
    * Áp dụng kỹ thuật **Phân tích giá trị biên** cho các trường dữ liệu (Tuổi, SĐT, Hạn thẻ).

---
## 4. Các Use Case chính

1.  **Quản lý Sách:** Nhập liệu, phân loại sách theo chuyên ngành (CNTT, Kinh tế, Ngoại ngữ...).
2.  **Quản lý Mượn - Trả:** Ghi nhận mã sách, mã độc giả, tự động chuyển trạng thái "Đang mượn" hoặc "Sẵn có".
3.  **Quản lý Độc giả:** Lưu trữ thông tin định danh, kiểm soát số lượng sách đang mượn thực tế.
4.  **Tính phí phạt:** Tự động so sánh ngày trả thực tế với ngày hẹn trả để xuất hóa đơn phạt.

---