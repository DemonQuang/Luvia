# CẨM NANG CÔNG NGHỆ & KẾT NỐI DATABASE — DỰ ÁN LUVIA

Tài liệu này cung cấp chi tiết về các công nghệ đang được áp dụng trong dự án **Luvia**, kiến trúc kết nối Database MongoDB Atlas, và phân tích các ưu điểm nổi trội của **Node.js** khi so sánh với các công nghệ backend khác (như PHP, Java, Python).

---

## 1. SƠ ĐỒ LUỒNG DỮ LIỆU & KẾT NỐI DATABASE

```mermaid
sequenceDiagram
    participant Client as Browser (React + Vite)
    participant Nginx as Nginx (Reverse Proxy trên VPS)
    participant FE as Frontend Container (cổng 8080)
    participant BE as Backend Container (cổng 3000)
    participant DB as MongoDB Atlas (Cloud)

    Client->>Nginx: 1. Gửi request (HTTPS)
    Nginx->>FE: 2a. Nếu truy cập trang tĩnh (HTML/JS/CSS)
    Nginx->>BE: 2b. Chuyển tiếp nếu là API (/api/* hoặc /uploads/*)
    BE->>DB: 3. Kết nối / Đọc ghi dữ liệu (Mongoose)
    DB-->>BE: 4. Trả về kết quả truy vấn
    BE-->>Nginx: 5. Trả về JSON Response
    Nginx-->>Client: 6. Hiển thị kết quả cho người dùng
```

---

## 2. CHI TIẾT SỬ DỤNG CÁC CÔNG NGHỆ TRONG DỰ ÁN

Dự án **Luvia** là sự kết hợp của kiến trúc hiện đại, tách biệt hoàn toàn giữa Frontend (giao diện) và Backend (dữ liệu):

### A. Frontend (FE/): React.js + Vite + TypeScript
*   **Vite**: Công cụ build frontend thế hệ mới. Khác với Webpack truyền thống phải đóng gói toàn bộ ứng dụng trước khi chạy, Vite tận dụng ES Modules gốc của trình duyệt giúp khởi chạy môi trường dev và phản hồi sửa đổi (Hot Module Replacement) chỉ trong tích tắc.
*   **React.js (SPA)**: Thư viện xây dựng giao diện người dùng theo component. Nhờ cơ chế Virtual DOM, React chỉ render lại những phần giao diện thay đổi thực sự trên trang, giúp trải nghiệm cuộn và chuyển trang mượt mà không cần tải lại toàn bộ trang web.
*   **TypeScript**: Cung cấp cơ chế kiểm soát kiểu (Static Typing) chặt chẽ. TypeScript giúp phát hiện các lỗi logic ngay khi đang code (ví dụ truyền sai thuộc tính, gọi hàm sai tham số), thay vì để lỗi xảy ra ở runtime trên trình duyệt của người dùng.
*   **Three.js**: Thư viện đồ họa 3D được sử dụng để tạo các hiệu ứng visual sinh động (nền trái tim bay nhảy, hạt rơi tự do) giúp trang kỷ niệm tình yêu có chiều sâu thẩm mỹ.

### B. Backend (BE/): Node.js + Express.js
*   **Express.js**: Khung ứng dụng (Framework) tối giản cho Node.js, cung cấp hệ thống định tuyến (Routing) mạnh mẽ và cơ chế Middleware tiện lợi để kiểm soát vòng đời request gửi lên.
*   **Multer**: Thư viện trung gian chuyên xử lý định dạng dữ liệu `multipart/form-data`. Nó nhận các file âm thanh (.mp3) và hình ảnh (.jpg, .png) do người dùng tải lên, kiểm tra tính hợp lệ và ghi vào ổ đĩa cứng server.
*   **jsonwebtoken (JWT)**: Cơ chế xác thực không lưu trạng thái (Stateless Authentication). Sau khi đăng nhập thành công, server mã hóa thông tin người dùng thành một chuỗi Token và gửi về Client. Client lưu trong `localStorage` và gửi kèm trong Headers của mỗi request tiếp theo để xác thực quyền truy cập.

### C. Cơ sở dữ liệu: MongoDB + Mongoose
*   **MongoDB**: Hệ quản trị cơ sở dữ liệu phi quan hệ (NoSQL) lưu trữ dưới dạng văn bản giống JSON (BSON). Cực kỳ thích hợp cho các dự án linh hoạt như Luvia (các mẫu kỷ niệm có thể thêm bớt thuộc tính động như nhạc nền, cấu trúc trang trí mà không cần khóa ngoại phức tạp).
*   **Mongoose**: Thư viện ODM (Object Data Modeling) hỗ trợ ánh xạ các Document trong MongoDB thành các Object trong code Node.js, cung cấp các công cụ khai báo Schema, xác thực dữ liệu đầu vào và thực hiện truy vấn dễ dàng.

### D. Hạ tầng & Triển khai: Docker + Nginx
*   **Docker & Docker Compose**: Container hóa giúp "đóng băng" môi trường. Ứng dụng chạy trên Windows của nhà phát triển thế nào thì khi lên VPS Ubuntu cũng sẽ chạy chuẩn xác 100% như vậy.
*   **Nginx**: Đóng vai trò máy chủ phản hồi ngược (Reverse Proxy). Nó đứng ở đầu cổng 80/443 của VPS đón request, nén dữ liệu gzip để tăng tốc độ tải, và giải quyết bài toán định tuyến SPA (tránh lỗi 404 khi người dùng reload trang `/dashboard`).

---

## 3. CƠ CHẾ KẾT NỐI DATABASE TRONG DỰ ÁN

Việc kết nối Database MongoDB Atlas được tổ chức khoa học qua các bước sau:

### 1. Cấu hình biến môi trường
Chuỗi kết nối được tách biệt hoàn toàn khỏi mã nguồn và đặt trong biến `MONGO_URI` tại file `.env` (Local) hoặc truyền qua file Compose (VPS):
```env
MONGO_URI = mongodb+srv://Luvia:Luvia@luvia.ovii8ij.mongodb.net/?appName=Luvia
```

### 2. File kết nối tập trung [BE/src/config/db.js](file:///c:/DoAnCacMon/Luvia/BE/src/config/db.js)
```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Dừng server nếu kết nối thất bại
    }
};

export default connectDB;
```

### 3. Gọi hàm kết nối khi khởi động server [BE/src/app.js](file:///c:/DoAnCacMon/Luvia/BE/src/app.js)
Hàm `connectDB` được import và kích hoạt ngay đầu tệp cấu hình chính để đảm bảo Database phải sẵn sàng trước khi server Express lắng nghe các cổng mạng.

---

## 4. NODE.JS CÓ GÌ NỔI TRỘI HƠN SO VỚI CÁC CÔNG NGHỆ KHÁC?

Khi phỏng vấn hoặc so sánh Node.js với các công nghệ backend truyền thống như **PHP (Laravel)**, **Java (Spring Boot)**, hay **Python (Django/FastAPI)**, Node.js thể hiện các ưu điểm vượt trội sau:

### 1. Đồng nhất ngôn ngữ (Single Language Stack)
*   **Node.js**: Cả Frontend (React) và Backend (Node) đều viết bằng **JavaScript/TypeScript**.
*   **Điểm nổi trội:** 
    *   Lập trình viên chỉ cần thành thạo một ngôn ngữ duy nhất, không phải chuyển đổi tư duy (Context Switching) khi viết FE và BE.
    *   Dễ dàng chia sẻ code, chia sẻ các interface/type định nghĩa dữ liệu giữa FE và BE giúp giảm thiểu sự bất đồng bộ trong thiết kế API.

### 2. Mô hình Bất đồng bộ & Non-blocking I/O (Single-threaded Event Loop)
*   **So sánh cơ chế:**
    *   *PHP / Java truyền thống:* Sử dụng mô hình **Multi-threaded**. Mỗi khi có một request gửi đến, server phải sinh ra một Thread (luồng xử lý) mới. Nếu Thread này bận chờ đọc cơ sở dữ liệu (I/O), nó sẽ bị khóa lại (Blocking) khiến tài nguyên RAM bị chiếm giữ. Khi có hàng ngàn người truy cập cùng lúc, máy chủ dễ bị tràn RAM dẫn tới crash.
    *   *Node.js:* Chạy trên một luồng chính duy nhất (**Single-threaded Event Loop**). Khi gặp các tác vụ tốn thời gian như đọc file, gọi API bên thứ ba hay truy vấn database, Node.js sẽ giao việc đó cho các luồng ngầm của hệ điều hành xử lý và tiếp tục nhận các request khác. Khi tác vụ I/O hoàn thành, nó sẽ báo về Event Loop để trả kết quả cho người dùng.
*   **Điểm nổi trội:** Node.js tiêu tốn cực kỳ ít tài nguyên RAM nhưng lại có khả năng xử lý **hàng chục nghìn kết nối đồng thời** (High Concurrency). Rất thích hợp cho các ứng dụng Real-time (Chat, thông báo) hoặc các ứng dụng nặng về đọc ghi (I/O Intensive) như Luvia.

### 3. Tốc độ thực thi vượt trội nhờ V8 Engine
*   Node.js được xây dựng trên **V8 Engine** của Google Chrome (biên dịch trực tiếp JavaScript sang mã máy thay vì chạy qua một lớp thông dịch chậm chạp). Do đó, tốc độ xử lý tính toán thô của Node.js vượt trội hơn hẳn so với PHP hay Python thông thường.

### 4. Hệ sinh thái NPM lớn nhất thế giới
*   Kho lưu trữ thư viện của Node.js (NPM) là lớn nhất thế giới. Bất kỳ tính năng phổ biến nào (như bảo mật, giới hạn request, xử lý ảnh, tạo token...) đều có sẵn các thư viện chất lượng cao được cộng đồng tối ưu và đóng gói sẵn. Việc tích hợp chỉ mất vài giây qua lệnh `npm install`.

### Bảng so sánh tóm tắt giữa Node.js và các công nghệ khác:

| Tiêu chí | Node.js (JavaScript) | PHP (Laravel) | Java (Spring Boot) | Python (FastAPI/Django) |
| :--- | :--- | :--- | :--- | :--- |
| **Mô hình xử lý** | Single-threaded Event Loop | Multi-process / Thread | Multi-threaded | Single-threaded / Multi-threaded |
| **Độ trễ I/O** | Cực thấp (Non-blocking) | Cao (Blocking) | Trung bình (Có hỗ trợ Async) | Thấp (Async/Await) |
| **Tốc độ Dev** | Siêu nhanh | Nhanh | Chậm (Phải build/compile lâu) | Nhanh |
| **Tiêu tốn RAM** | Rất thấp | Trung bình | Rất cao | Thấp |
| **Thế mạnh** | Real-time, SPA Backend, API Gateway | Web truyền thống (SSR), thương mại điện tử | Hệ thống tài chính lớn, Bảo mật cao của doanh nghiệp | AI/ML, Data Science, API hiệu năng cao |

---

## 5. MẸO TRẢ LỜI PHỎNG VẤN TỪ DỰ ÁN NÀY

Khi nhà tuyển dụng hỏi: **"Tại sao bạn chọn kết hợp React với Node.js và MongoDB cho dự án Luvia?"**, hãy tự tin trả lời:

1.  **Về hiệu năng:** *"Em chọn Node.js làm API backend vì đây là nền tảng tối ưu tốt nhất cho tác vụ I/O-intensive như dự án Luvia (người dùng tải lên hình ảnh và nhạc liên tục). Cơ chế Non-blocking giúp server phục vụ hàng ngàn người truy cập trang kỷ niệm cùng lúc mà không lo nghẽn luồng."*
2.  **Về tính linh hoạt:** *"Dữ liệu trang kỷ niệm tình yêu của người dùng có cấu trúc rất đa dạng (có trang có nhạc, trang không; có trang chọn giao diện này, trang chọn giao diện kia). Cơ sở dữ liệu NoSQL của MongoDB cho phép em lưu trữ cấu trúc JSON linh hoạt mà không cần mất thời gian bảo trì, dịch chuyển bảng (migration) phức tạp như SQL."*
3.  **Về năng suất phát triển:** *"Việc sử dụng chung một ngôn ngữ JavaScript/TypeScript trên toàn bộ hệ thống giúp em viết code rất nhanh, dễ dàng đồng bộ định nghĩa kiểu dữ liệu và tái sử dụng kiến thức tư duy từ React sang Node.js."*
