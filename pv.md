# CẨM NANG PHỎNG VẤN BACKEND TOÀN DIỆN (CHUYÊN SÂU DỰ ÁN SMART LIBRARY)

> **Tài liệu chuẩn bị phỏng vấn kỹ thuật (Technical Interview Cheatsheet)**  
> **Dự án:** Hệ Thống Quản Lý Thư Viện Thông Minh (Smart Library System)  
> **Tech Stack chính:** NestJS, TypeScript, TypeORM, ACID Transactions, Jest (95/95 tests PASS), MS SQL Server / PostgreSQL.

---

## MỤC LỤC
1. [Giới thiệu Tổng quan Dự án (Project Overview & Elevator Pitch)](#1-giới-thiệu-tổng-quan-dự-án-project-overview--elevator-pitch)
2. [Lựa chọn Công nghệ, Ngôn ngữ & So sánh Đối chiếu](#2-lựa-chọn-công-nghệ-ngôn-ngữ--so-sánh-đối-chiếu)
3. [Giao dịch ACID & Quản lý Kho - Phí phạt (TypeORM Transaction)](#3-giao-dịch-acid--quản-lý-kho---phí-phạt)
4. [Cơ chế Hàng đợi FIFO & Xử lý duyệt mượn tự động](#4-cơ-chế-hàng-đợi-fifo--xử-lý-duyệt-mượn-tự-động)
5. [Kỹ thuật "Guarded Soft Delete" & Ràng buộc toàn vẹn](#5-kỹ-thuật-guarded-soft-delete--ràng-buộc-toàn-vẹn)
6. [Kiến trúc Phân quyền RBAC & Request Lifecycle trong NestJS](#6-kiến-trúc-phân-quyền-rbac--request-lifecycle-trong-nestjs)
7. [Chiến lược Kiểm thử tự động Jest (95/95 Tests Pass)](#7-chiến-lược-kiểm-thử-tự-động-jest-9595-tests-pass)
8. [Các kịch bản System Design & Concurrency Nâng cao (Senior Round)](#8-các-kịch-bản-system-design--concurrency-nâng-cao)

---

## 1. GIỚI THIỆU TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW & ELEVATOR PITCH)

### 📌 1.1 Tóm tắt Dự án & Bài toán Nghiệp vụ
* **Tên dự án:** Hệ Thống Quản Lý Thư Viện Thông Minh (Smart Library Management System - LMS).
* **Bối cảnh & Vấn đề giải quyết:**
  * Các thư viện truyền thống hoặc hệ thống CRUD đơn giản thường gặp rủi ro nghiêm trọng về **lệch dữ liệu kho sách** và **thất thoát tài sản**:
    * Khi độc giả trả sách hỏng hoặc mất sách, quá trình tính phí phạt và trừ kho diễn ra rời rạc, nếu server gặp sự cố giữa chừng thì dữ liệu sách và tiền phạt bị sai lệch.
    * Tình trạng "tranh chấp mượn sách" khi sách sắp hết (nhiều người cùng đặt mượn bản sao cuối cùng).
    * Sách hoặc tài khoản độc giả bị xóa tùy tiện dù vẫn đang mượn sách chưa trả.
* **Giải pháp của dự án:**
  * Xây dựng Backend chuẩn kiến trúc doanh nghiệp với **NestJS & TypeScript**, áp dụng **ACID Transactions** đảm bảo tính nguyên tử tuyệt đối cho chu trình mượn/trả/phạt kho.
  * Tự động hóa xếp hàng mượn sách theo thứ tự ưu tiên **FIFO (First In First Out)**.
  * Kiểm soát toàn vẹn dữ liệu bằng kỹ thuật **Guarded Soft Delete** và phân quyền đa tầng **RBAC** (Admin, Librarian, Reader).
  * Kiểm thử tự động toàn diện với **95/95 ca test đạt 100% Pass** bằng Jest.

---

### 🎙️ 1.2 Mẫu kịch bản 90 giây trả lời câu hỏi: *"Em hãy giới thiệu tổng quan về dự án và vai trò của em?"*
> *"Chào anh/chị, dự án Smart Library là hệ thống quản lý thư viện số hóa toàn diện mà em đảm nhiệm vai trò Backend Developer chính.*
>
> *Hệ thống phục vụ 3 nhóm đối tượng: Độc giả (Reader), Thủ thư (Librarian) và Quản trị viên (Admin). Điểm cốt lõi mà em tập trung giải quyết trong dự án này không dừng lại ở các thao tác CRUD thông thường, mà là **tính toàn vẹn dữ liệu tài sản thư viện và quản trị rủi ro concurrency**:*
> 1. *Em thiết kế chu trình hoàn trả sách và bồi thường hỏng/mất thành một **ACID Transaction** nguyên tử, liên kết đồng bộ giữa tính phạt (FineLog), trạng thái phiếu mượn (Loan) và điều chỉnh số lượng kho (Book).*
> 2. *Triển khai cơ chế hàng đợi **FIFO** để duyệt yêu cầu mượn công bằng theo thời gian đăng ký khi sách khan hiếm.*
> 3. *Áp dụng kỹ thuật **Guarded Soft Delete** nhằm bảo vệ dữ liệu lịch sử và chặn xóa tài nguyên khi đang có ràng buộc mượn dở dang.*
> 4. *Để đảm bảo hệ thống production-ready, em đã tự tay xây dựng bộ test tự động với **95 test cases đạt 100% PASS** trên Jest, bao phủ toàn bộ các edge case nghiệp vụ như quá hạn, thẻ hết hạn, vượt giới hạn mượn và rollback giao dịch.*
>
> *Dự án giúp em làm chủ kiến trúc NestJS chuyên sâu, quản lý Concurrency trên RDBMS và tư duy viết mã chuẩn kiểm thử."*

---

## 2. LỰA CHỌN CÔNG NGHỆ, NGÔN NGỮ & SO SÁNH ĐỐI CHIẾU

### 📌 2.1 Ngôn ngữ: TypeScript
* **Tại sao lựa chọn TypeScript?**
  * **Static Typing & Compile-time Safety:** Phát hiện lỗi kiểu dữ liệu ngay khi code thay vì để lỗi phát sinh ở Runtime trên Production (đặc biệt quan trọng khi tính toán tiền phạt `fine_amount`, trạng thái enum `LoanStatus`, ngày tháng timestamp).
  * **Hỗ trợ Decorators & Metadata Reflection:** Tương thích tự nhiên với cơ chế Dependency Injection, Guard, Interceptor và Class-Validator của NestJS.
  * **Khả năng Refactor & Maintain:** Dự án thư viện có quan hệ thực thể phức tạp (Book, User, Loan, FineLog). TypeScript giúp định nghĩa Interface/DTO rõ ràng, tự động gợi ý code và refactor cực kỳ an toàn khi logic thay đổi.
* **So sánh TypeScript với các lựa chọn khác:**

| Tiêu chí | TypeScript | JavaScript (Node.js thuần) | Python (FastAPI/Django) | Go (Golang) |
| :--- | :--- | :--- | :--- | :--- |
| **Kiểm soát kiểu dữ liệu** | Static Typing mạnh mẽ, interface phong phú. | Dynamic typing, dễ gặp lỗi runtime `undefined is not a function`. | Type hints (FastAPI pydantic), nhưng vẫn là dynamic lúc runtime. | Static Typing cực kỳ chặt chẽ, biên dịch trực tiếp ra mã máy. |
| **Tốc độ phát triển (Time-to-Market)** | Rất nhanh, hỗ trợ IntelliSense, autocomplete thông minh. | Nhanh ban đầu, nhưng ác mộng khi hệ thống lớn dần và refactor. | Rất nhanh, cú pháp ngắn gọn, thích hợp cho AI/Data và CRUD nhanh. | Chậm hơn đôi chút do cú pháp tường minh, ít abstraction có sẵn. |
| **Performance & Concurrency** | Non-blocking I/O (Event Loop), xử lý hàng ngàn I/O requests tốt. | Tương đương TypeScript. | Thấp hơn Node.js trong xử lý I/O đồng thời (dù FastAPI dùng async/await). | **Vô địch về concurrency** nhờ Goroutines & Channels siêu nhẹ. |
| **Lý do không chọn ngôn ngữ khác cho dự án này:** | Được chọn vì cân bằng hoàn hảo giữa hiệu năng I/O của Node.js và tính chặt chẽ hướng đối tượng của hệ sinh thái doanh nghiệp. | JS thuần thiếu an toàn kiểu dữ liệu, khó kiểm soát nghiệp vụ tài chính/kho. | Python không có hệ sinh thái Dependency Injection & Modular mạnh mẽ như NestJS. | Go phù hợp Microservices hạ tầng thấp, nhưng tốn nhiều boilerplate code cho nghiệp vụ quản lý quan hệ phong phú như thư viện. |

---

### 📌 2.2 Framework: NestJS
* **Tại sao lựa chọn NestJS?**
  * **Kiến trúc Modular & Dependency Injection (DI):** Tổ chức mã nguồn theo module rõ ràng (`BooksModule`, `LoansModule`, `UsersModule`), giảm thiểu phụ thuộc lỏng lẻo (loose coupling) và giúp việc Unit Test trở nên dễ dàng nhờ mock DI.
  * **Triết lý Opinionated (Chuẩn hóa quy chuẩn):** Cung cấp sẵn các chuẩn mực kiến trúc doanh nghiệp: Guards (bảo mật), Interceptors (ghi log/biến đổi response), Pipes (validate dữ liệu), Filters (bắt lỗi tập trung).
  * **Request Lifecycle chặt chẽ:** Cho phép chặn đứng dữ liệu sai ngay từ vòng gửi xe bằng `ValidationPipe` kết hợp DTOs.
* **So sánh NestJS với các Framework khác:**

| Tiêu chí | NestJS | Express.js (thuần) | Spring Boot (Java) |
| :--- | :--- | :--- | :--- |
| **Cấu trúc kiến trúc** | **Opinionated:** Cấu trúc module, controller, service chuẩn mực như Angular/Spring. | **Unopinionated:** Tự do hoàn toàn, không có cấu trúc bắt buộc. | **Opinionated:** Chuẩn mực doanh nghiệp lâu đời, kiến trúc phân lớp kinh điển. |
| **Khả năng mở rộng dự án lớn (Scalability)** | **Rất cao:** Team đông người vào làm vẫn theo chung một quy chuẩn, code không bị phân mảnh. | **Kém:** Mỗi lập trình viên viết một kiểu, dự án lớn dễ thành "Spaghetti code". | **Rất cao:** Là tượng đài trong các hệ thống Banking và Enterprise lớn. |
| **Tiêu tốn tài nguyên & Khởi động** | Nhẹ nhàng, khởi động vài giây, tốn ít RAM (vài chục đến ~100MB). | Rất nhẹ, khởi động tức thì. | **Nặng nề:** Cần JVM, tốn hàng trăm MB đến cả GB RAM, khởi động lâu. |
| **Testing Support** | Tích hợp sẵn Jest, hỗ trợ `@nestjs/testing` tạo module test giả lập cực kỳ tiện. | Phải tự cấu hình Jest/Mocha từ đầu, mock thủ công rất vất vả. | Tích hợp sẵn JUnit, Mockito rất mạnh mẽ. |
| **Tại sao chọn NestJS thay vì Express/Spring Boot?** | Đạt được tính chuẩn hóa của Spring Boot nhưng vẫn giữ được sự linh hoạt, nhẹ nhàng và cộng đồng npm khổng lồ của Node.js. | Express quá tự do, dễ sinh code ẩu khi nghiệp vụ phức tạp. | Spring Boot quá cồng kềnh cho bài toán thư viện này, tốn tài nguyên phần cứng không cần thiết. |

---

### 📌 2.3 ORM: TypeORM
* **Tại sao lựa chọn TypeORM?**
  * **Hỗ trợ cả Data Mapper và Active Record:** Linh hoạt trong việc thiết kế Entity và Repository.
  * **Hỗ trợ Transaction & QueryRunner trực tiếp:** Dễ dàng kiểm soát isolation level, transaction rollback khi thực hiện các nghiệp vụ nhạy cảm giữa nhiều bảng.
  * **Đa cơ sở dữ liệu (Database Agnostic):** Codebase của dự án có thể chạy mượt mà trên cả MS SQL Server lẫn PostgreSQL mà không cần viết lại câu lệnh SQL nghiệp vụ.
* **So sánh TypeORM vs Prisma vs Raw SQL:**

| Tiêu chí | TypeORM | Prisma | Raw SQL (knex / pg) |
| :--- | :--- | :--- | :--- |
| **Mô hình tiếp cận** | **Code-First:** Định nghĩa Entity bằng TypeScript class & decorators. | **Schema-First:** Viết file `schema.prisma`, sinh client tự động. | Không có mô hình, tự viết chuỗi SQL query. |
| **Kiểm soát Transaction phức tạp** | **Rất tốt:** Cho phép dùng `QueryRunner`, `manager.transaction`, rollback tường minh. | Hỗ trợ Interactive Transaction tốt, nhưng query builder hạn chế hơn khi cần câu lệnh SQL đặc thù. | Tuyệt đối kiểm soát từng lệnh `BEGIN`, `COMMIT`, `ROLLBACK`. |
| **Tương thích MS SQL Server / Enterprise DB** | Hỗ trợ lâu đời và hoàn thiện tốt với MS SQL Server. | Hỗ trợ SQL Server nhưng một số tính năng enterprise bị giới hạn. | Tùy thuộc vào driver lập trình viên dùng. |
| **Lý do chọn TypeORM:** | Dễ dàng tích hợp với kiến trúc Decorator của NestJS (`@InjectRepository`), hỗ trợ tốt Database Transaction cho bài toán trừ kho & tính phạt. | Prisma rất tốt nhưng TypeORM phù hợp hơn với tư duy OOP của NestJS và hỗ trợ tốt DB MS SQL Server trong dự án. | Raw SQL khó bảo trì, không tự động map object và tốn thời gian migration. |

---

### 📌 2.4 Cơ sở dữ liệu: Relational DB (SQL Server / PostgreSQL) vs NoSQL (MongoDB)
* **Tại sao nghiệp vụ Thư viện BẮT BUỘC phải dùng Relational Database (RDBMS)?**
  * **Ràng buộc khóa ngoại (Foreign Keys & Referential Integrity):** Phiếu mượn `Loan` phải trỏ đúng `reader_id` (User) và `book_id` (Book). Nếu User hoặc Book không tồn tại, DB phải tự động chặn.
  * **Nguyên lý ACID toàn vẹn:** Nghiệp vụ mượn sách liên quan trực tiếp đến số lượng kho (`available`) và tiền phạt (`fine_amount`). Không thể chấp nhận hiện tượng "nhất quán cuối cùng" (Eventual Consistency) của NoSQL.
  * **Tại sao không dùng MongoDB (NoSQL)?**
    * MongoDB thiết kế cho dữ liệu dạng tài liệu độc lập, phân tán cao. Khi cần join nhiều bảng (`User` -> `Loan` -> `Book` -> `FineLog`) và đảm bảo trừ kho không bị âm, MongoDB xử lý multi-document transaction chậm và phức tạp hơn rất nhiều so với RDBMS.

---

## 3. GIAO DỊCH ACID & QUẢN LÝ KHO - PHÍ PHẠT

### 📌 Trọng tâm trong Codebase:
- File triển khai: `backend/src/loans/loans.service.ts` (các phương thức `confirmReturnClean` và `reportDamageOrLoss`).
- Sử dụng: `this.dataSource.transaction(async (manager) => { ... })`.

---

### Câu hỏi 1: Tại sao em lại cần bọc chu trình trả sách và tính phí phạt vào Database Transaction (ACID)?
* **Ý đồ của Interviewer:** Kiểm tra hiểu biết về tính toàn vẹn dữ liệu (Data Consistency), hiểu rủi ro khi hệ thống gặp sự cố giữa chừng.
* **Cách trả lời chuẩn Senior:**
  * *"Khi bạn đọc trả một cuốn sách (đặc biệt là trường hợp sách bị rách hoặc mất - `Damaged` / `Lost`), nghiệp vụ không chỉ là đổi trạng thái của 1 bản ghi đơn lẻ, mà là một chuỗi thao tác liên bảng:*
    1. *Tạo bản ghi biên bản phạt trong bảng `FineLog` (ghi nhận tiền phạt, lý do phạt trễ hạn hoặc làm hỏng/mất).*
    2. *Cập nhật trạng thái phiếu mượn trong bảng `Loan` sang `Returned`, `Damaged` hoặc `Lost` kèm mốc thời gian `return_date`.*
    3. *Cập nhật tồn kho trong bảng `Book`: nếu trả sách lành lặn thì tăng `available + 1`, nếu báo mất sách (`Lost`) thì giảm tổng số lượng `quantity - 1`.*
  * *Nếu không có ACID Transaction, giả sử bước 1 (tạo FineLog) thành công nhưng đến bước 3 server bị crash hoặc DB connection bị ngắt, sách đã bị trừ mất khỏi kho nhưng phiếu mượn vẫn treo, hoặc ngược lại phiếu mượn báo hoàn tất nhưng kho chưa cập nhật. Dữ liệu sẽ rơi vào trạng thái 'bất nhất' (Inconsistent). Bọc trong Transaction đảm bảo nguyên lý **Atomicity (Nguyên tử)**: Tất cả cùng thành công, hoặc nếu có lỗi thì tự động **Rollback** 100% về trạng thái ban đầu."*

---

### Câu hỏi 2: Trong NestJS & TypeORM, em triển khai Transaction như thế nào? Cần lưu ý bẫy (pitfall) phổ biến nào?
* **Ý đồ của Interviewer:** Bắt lỗi dùng sai Repository trong Transaction Callback (Lỗi kinh điển của ứng viên chép code trên mạng).
* **Cách trả lời chuẩn:**
  * *"Trong NestJS, em inject `DataSource` vào Service và dùng hàm `dataSource.transaction(async (manager) => { ... })`.*
  * **Bẫy chết người cần tránh:** *Khi thao tác bên trong transaction, bắt buộc phải dùng instance `manager` (EntityManager được cấp riêng cho connection của transaction đó), ví dụ: `manager.save(Book, book)` hoặc `manager.update(Loan, id, ...)`. Tuyệt đối không được gọi lại `this.bookRepository` hay `this.loanRepository` đã inject ở constructor, vì các repository đó chạy trên connection pool thông thường nằm ngoài transaction, dẫn đến việc transaction rollback nhưng repository ngoài vẫn ghi vào DB."*

---

### Câu hỏi 3 (Tình huống Concurrency): Nếu 2 người cùng bấm trả sách hoặc mượn cuốn sách cuối cùng (`available = 1`) tại cùng một thời điểm, Race Condition xử lý ra sao?
* **Ý đồ của Interviewer:** Kiểm tra tư duy về Concurrency Control (Optimistic vs Pessimistic Locking).
* **Cách trả lời chuẩn:**
  * *"Hiện tại trong code, em thực hiện kiểm tra `available > 0` trước khi cho mượn và cập nhật. Tuy nhiên trong môi trường Concurrency cao, hai transaction song song có thể cùng đọc `available = 1` trước khi lệnh update kịp ghi (Lost Update / Race Condition).*
  * *Để giải quyết triệt để ở cấp độ Production, có 2 cách:*
    1. **Pessimistic Locking (Khóa bi quan):** Sử dụng `manager.findOne(Book, { where: { id }, lock: { mode: 'pessimistic_write' } })` (tương đương câu lệnh `SELECT ... FOR UPDATE` trong SQL). Transaction thứ 2 sẽ phải chờ transaction thứ 1 commit xong mới được đọc và sửa.
    2. **Atomic SQL Update:** Cập nhật có điều kiện trực tiếp:
       ```sql
       UPDATE books SET available = available - 1 WHERE id = :id AND available > 0;
       ```
       Nếu `affectedRows === 0`, ném ra lỗi sách đã hết.*

---

## 4. CƠ CHẾ HÀNG ĐỢI FIFO & XỬ LÝ DUYỆT MƯỢN TỰ ĐỘNG

### 📌 Trọng tâm trong Codebase:
- File triển khai: `backend/src/loans/loans.service.ts` (`approvePendingLoan`).
- Test suite: `backend/src/loans/loans.service.spec.ts` (test case: `"should throw BadRequestException if FIFO order is violated"`).

---

### Câu hỏi 1: Em thiết kế cơ chế hàng đợi FIFO duyệt mượn sách như thế nào?
* **Ý đồ của Interviewer:** Xem ứng viên hiểu thuật ngữ "FIFO" trong bối cảnh ứng dụng thực tế ra sao.
* **Cách trả lời chuẩn:**
  * *"Hệ thống áp dụng nguyên tắc ai đăng ký mượn trước thì được ưu tiên duyệt trước (First In First Out):*
    * *Khi một cuốn sách đang khan hiếm (số lượng có hạn), các yêu cầu mượn gửi lên sẽ ở trạng thái `Pending` với timestamp `created_at`.*
    * *Khi Admin hoặc Thủ thư duyệt một phiếu mượn, hàm `approvePendingLoan(loanId)` sẽ truy vấn tìm bản ghi `Pending` có `created_at` nhỏ nhất của cuốn sách đó.*
    * *Nếu phiếu mượn đang được duyệt không phải là phiếu sớm nhất, hệ thống sẽ từ chối và cảnh báo: 'Cuốn sách này đang có bạn đọc đăng ký trước (Phiếu #ID). Vui lòng duyệt theo thứ tự ai đăng ký trước duyệt trước'."*

---

### Câu hỏi 2 (Phản biện): Cách làm này kiểm tra ở tầng Database Query. Nếu quy mô thư viện có 10.000 yêu cầu mượn cùng lúc, giải pháp này có nhược điểm gì và em cải tiến thế nào?
* **Ý đồ của Interviewer:** Đánh giá khả năng scale hệ thống (Junior thì bảo vệ code cũ, Senior sẽ nhìn ra trade-offs).
* **Cách trả lời chuẩn Senior:**
  * *"Điểm hạn chế của việc query DB trực tiếp:*
    * *Gây tải lớn cho Database nếu có nhiều request đọc/ghi đồng thời.*
    * *Vẫn có thể bị Race Condition nếu 2 thủ thư cùng click duyệt 2 phiếu khác nhau của cùng 1 sách tại cùng một mili-giây.*
  * *Giải pháp tối ưu cho Production Scale:*
    * *Tách việc xếp hàng ra khỏi Relational DB bằng cách sử dụng **Message Queue** như **Redis BullMQ** hoặc **RabbitMQ**.*
    * *Mỗi đầu sách sẽ tương ứng với một FIFO Queue trên Redis. Khi độc giả ấn mượn, job được push vào queue. Một background worker sẽ tiêu thụ tuần tự (single-consumer per book) để đảm bảo tính tuần tự tuyệt đối, không nghẽn DB và phản hồi tức thì về phía client."*

---

## 5. KỸ THUẬT "GUARDED SOFT DELETE" & RÀNG BUỘC TOÀN VẸN

### 📌 Trọng tâm trong Codebase:
- File triển khai: `backend/src/books/books.service.ts` (`remove`), `backend/src/users/users.service.ts` (`removeUser`).
- Sử dụng: `softDelete()` kết hợp kiểm tra `activeLoanCount`.

---

### Câu hỏi 1: Tại sao lại gọi là "Guarded Soft Delete"? Nó khác gì với Soft Delete thông thường?
* **Ý đồ của Interviewer:** Kiểm tra xem đây có phải thuật ngữ "chém gió" hay có giá trị kiến trúc thật sự.
* **Cách trả lời chuẩn:**
  * *"Soft Delete thông thường chỉ đơn giản là đánh dấu cờ `deleted_at` hoặc đổi `is_deleted = true` thay vì xóa vật lý (Hard Delete).*
  * *Tuy nhiên trong hệ thống thư viện, nếu một cuốn sách hoặc một bạn đọc đang có giao dịch mượn dở dang (`Pending`, `Borrowing`, `Overdue`), việc cho phép soft-delete sẽ làm hỏng dữ liệu báo cáo, mất dấu vết tài sản thư viện và không đòi lại được sách.*
  * *Kỹ thuật **'Guarded Soft Delete'** nghĩa là:*
    1. *Bắt buộc phải qua một 'tầng bảo vệ' (Guard / Validation constraint) trước khi thực hiện xóa mềm.*
    2. *Hệ thống đếm số phiếu mượn chưa hoàn tất (`loanRepository.count({ where: { book_id, status: In(['Pending', 'Borrowing', 'Overdue']) } })`).*
    3. *Nếu `activeLoanCount > 0`, chặn lại ngay và ném ra `BadRequestException` kèm thông báo chi tiết.*
    4. *Chỉ khi tất cả sách đã được trả nguyên vẹn và tiền phạt đã thanh toán xong mới cho phép `softDelete()`."*

---

### Câu hỏi 2: Khi dùng Soft Delete, nếu bảng `User` có trường `email` là `UNIQUE`, người dùng bị soft-delete rồi sau đó đăng ký lại cùng email thì xử lý sao?
* **Ý đồ của Interviewer:** Một vấn đề kinh điển của Soft Delete trong quan hệ cơ sở dữ liệu.
* **Cách trả lời chuẩn:**
  * *Có 3 hướng giải quyết:*
    1. **Compound Unique Index (Chỉ mục kết hợp):** Đặt Unique Index trên cặp `(email, deleted_at)`. Khi active thì `deleted_at IS NULL` (lưu ý: trên PostgreSQL có thể dùng Partial Index `WHERE deleted_at IS NULL`, trên SQL Server dùng Filtered Unique Index).
    2. **Xáo trộn dữ liệu khi Soft Delete:** Khi xóa mềm, cập nhật email thành `email + '_deleted_' + timestamp`.
    3. **Cơ chế Khôi phục tài khoản (Reactivate):** Khi đăng ký bằng email đã soft-delete, hệ thống phát hiện và gợi ý mở khóa lại tài khoản cũ thay vì tạo mới.*

---

## 6. KIẾN TRÚC PHÂN QUYỀN RBAC & REQUEST LIFECYCLE TRONG NESTJS

### 📌 Trọng tâm trong Codebase:
- File triển khai:
  - `backend/src/common/guards/auth.guard.ts` (xác thực JWT)
  - `backend/src/common/guards/roles.guard.ts` (kiểm tra Role độc giả, thủ thư, admin)
  - `backend/src/common/decorators/roles.decorator.ts` (Custom Decorator `@Roles()`)

---

### Câu hỏi 1: Luồng thực thi RBAC trong NestJS hoạt động như thế nào từ lúc request tới?
* **Ý đồ của Interviewer:** Nắm vững NestJS Request Lifecycle (Middleware -> Guard -> Interceptor -> Pipe -> Controller).
* **Cách trả lời chuẩn:**
  1. *Request đi qua **`AuthGuard`**: Đọc JWT token từ header `Authorization: Bearer <token>`, verify chữ ký với secret key từ biến môi trường `JWT_SECRET`. Giải mã payload và gán thông tin `user` vào `request.user`.*
  2. *Request đi tiếp vào **`RolesGuard`**:*
     * *Dùng NestJS `Reflector` để đọc metadata quyền hạn đã được gắn trên endpoint thông qua custom decorator `@Roles('admin', 'librarian')`.*
     * *Nếu endpoint không yêu cầu role (metadata rỗng), cho phép đi qua (`return true`).*
     * *Nếu có yêu cầu role, so sánh `request.user.role` với danh sách role cho phép. Nếu không thỏa mãn, ném `ForbiddenException`.*
  3. *Chỉ khi cả 2 Guard pass thì request mới tới **ValidationPipe** (validate DTO) và vào **Controller** xử lý.*

---

### Câu hỏi 2: Giả sử User bị Admin hạ quyền từ `librarian` xuống `reader`, nhưng Token JWT vẫn còn hạn 2 tiếng. Làm sao để thu hồi quyền (Invalidate Token) ngay lập tức?
* **Ý đồ của Interviewer:** Kiểm tra kiến thức về Stateless JWT vs Stateful Invalidation.
* **Cách trả lời chuẩn:**
  * *"Bản chất của JWT là Stateless nên server không thể trực tiếp 'hủy' token đã phát ra trừ khi hết hạn.*
  * *Để giải quyết thu hồi quyền tức thì:*
    1. **Sử dụng Token Blacklist trên Redis:** Khi hạ quyền hoặc đổi mật khẩu, lưu `jti` (JWT ID) hoặc `userId` vào Redis với TTL bằng thời gian sống còn lại của token. Trong `AuthGuard`, check Redis xem token có trong blacklist không.
    2. **Token Versioning (`token_version`):** Lưu một cột `token_version` trong bảng User. Khi phát JWT, đưa version vào payload. Khi hạ quyền user, tăng `token_version` trong DB lên 1. Trong `AuthGuard`, so sánh version trong token với version hiện tại trong DB/Cache, nếu lệch thì từ chối ngay."*

---

## 7. CHIẾN LƯỢC KIỂM THỬ TỰ ĐỘNG JEST (95/95 TESTS PASS)

### 📌 Trọng tâm trong Codebase:
- File triển khai: `loans.service.spec.ts`, `books.service.spec.ts`, `users.service.spec.ts`, `auth.guard.spec.ts`, `roles.guard.spec.ts`.
- 100% Passed: 8 test suites, 95 unit tests.

---

### Câu hỏi 1: Em mock `DataSource` và `Transaction` trong Jest như thế nào để test được Service?
* **Ý đồ của Interviewer:** Xem ứng viên có trực tiếp viết mock phức tạp hay chỉ copy paste.
* **Cách trả lời chuẩn:**
  * *"Vì Service sử dụng `dataSource.transaction(async (manager) => { ... })`, nên trong file test spec:*
    * *Em tạo một `mockEntityManager` chứa các hàm mock (`save`, `update`, `findOne`, `create`).*
    * *Mock hàm `transaction` của `DataSource` bằng một hàm giả lập nhận callback và thực thi ngay với `mockEntityManager`:*
      ```typescript
      const mockDataSource = {
        transaction: jest.fn(async (cb: any) => cb(mockEntityManager)),
      };
      ```
    * *Nhờ đó, em có thể giả lập cả 2 kịch bản:*
      1. *Kịch bản thành công: `mockEntityManager.update` và `save` resolve dữ liệu thành công.*
      2. *Kịch bản rollback: Cho một hàm bên trong mock ném ra ngoại lệ (`mockRejectedValue`), kiểm tra xem Service có bắt lỗi và throw đúng Exception ra ngoài không."*

---

### Câu hỏi 2: 95 test case của em bao phủ những gì? Có test case nào làm em nhớ nhất?
* **Ý đồ của Interviewer:** Đánh giá tính trung thực và tư duy viết test chất lượng.
* **Cách trả lời chuẩn:**
  * *"95 test case của em bao phủ toàn bộ các tầng logic trọng yếu:*
    * *Xác thực điều kiện mượn: Thẻ thư viện hết hạn (`card_expiry < now`), tài khoản bị khóa (`status !== 'active'`), độc giả đã mượn chạm mốc tối đa 5 cuốn sách.*
    * *Xử lý trễ hạn & phạt tiền: Kiểm tra số ngày quá hạn, tính phạt hỏng sách (`Damaged`), phạt mất sách (`Lost` = 100% giá sách + phạt trễ hạn).*
    * *Thứ tự FIFO: Chặn duyệt khi có yêu cầu mượn trước đó chưa được xử lý.*
    * *Guarded Soft Delete: Chặn xóa sách/user khi còn phiếu mượn ở trạng thái `Pending/Borrowing/Overdue`.*
  * *Test case em nhớ nhất là việc xử lý đồng bộ trạng thái quá hạn (`syncOverdueStatuses`) trước khi tính toán điều kiện mượn, đảm bảo người mượn không thể 'lách luật' mượn thêm sách khi vừa quá hạn ở 1 phiếu khác."*

---

## 8. CÁC KỊCH BẢN SYSTEM DESIGN & CONCURRENCY NÂNG CAO

| Tình huống phỏng vấn | Phân tích vấn đề | Hướng giải quyết đề xuất (Senior Answer) |
| :--- | :--- | :--- |
| **Hàng ngàn sinh viên tranh nhau mượn sách đầu kỳ** | Gây nghẽn kết nối Database, Race Condition kho sách. | Sử dụng Redis để lưu cache số lượng sách tồn kho, áp dụng Redis Lua Script để kiểm tra và trừ tồn kho Atomic trước khi đẩy job vào Message Queue (BullMQ). |
| **Phát hiện sách quá hạn hàng ngày** | Quét toàn bộ bảng `Loan` bằng cronjob có thể làm chậm DB. | Đánh Index trên cặp `(status, due_date)`. Chạy NestJS Scheduled Task (Cron) vào ban đêm (giờ thấp điểm), phân trang (Batching / Chunking) để không chiếm dụng RAM và Lock table. |
| **Tách dịch vụ sang Microservices** | Dịch vụ Quản lý Sách (Book Service) và Dịch vụ Thanh toán / Phạt (Fine Service) ở 2 DB riêng biệt, không dùng DB Transaction thông thường được. | Chuyển sang mô hình **Saga Pattern** (Orchestration hoặc Choreography) kết hợp **Outbox Pattern** để đảm bảo tính nhất quán cuối cùng (Eventual Consistency) và cơ chế bù trừ (Compensating Transactions) khi có lỗi. |

---

## 🎯 BÍ QUYẾT TRẢ LỜI ĐỂ GÂY ẤN TƯỢNG VỚI INTERVIEWER
1. **Luôn thừa nhận Trade-off:** Không có giải pháp nào là hoàn hảo tuyệt đối. Ví dụ: *"Cách dùng `dataSource.transaction` trực tiếp trong monolith hiện tại rất nhanh, đơn giản và đảm bảo ACID tuyệt đối, nhưng đánh đổi lại là phụ thuộc vào 1 relational DB duy nhất. Nếu mở rộng Microservices, em sẽ chuyển sang Saga Pattern."*
2. **Dẫn chứng bằng con số và metrics:** Nhắc tới mốc `95/95 tests PASS`, xử lý `5 active loans limit`, logic phạt `overdueDays * fine_rate` để chứng minh bạn làm việc chặt chẽ, chi tiết.
3. **Phong thái tự tin, chủ động:** Dùng câu từ thể hiện quyền làm chủ mã nguồn như: *"Trong kiến trúc của em...", "Em chủ động bọc transaction ở đoạn này vì...", "Em lường trước trường hợp..."*.
