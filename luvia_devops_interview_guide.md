# CẨM NANG KIẾN TRÚC CODEBASE & TRIỂN KHAI DEVOPS — DỰ ÁN LUVIA
*(Tài liệu ôn luyện dành cho Phỏng vấn Full Stack & DevOps Engineer)*

Tài liệu này tổng hợp toàn bộ kiến trúc mã nguồn (Codebase), cấu trúc triển khai DevOps thực tế và quy trình bảo trì, nâng cấp của dự án **Luvia** (Trang web tạo trang kỷ niệm tình yêu). Hãy đọc kỹ tài liệu này để chuẩn bị tốt nhất trước các câu hỏi phỏng vấn tuyển dụng.

---

## PHẦN 1: KIẾN TRÚC CODEBASE & LUỒNG HOẠT ĐỘNG (MERN STACK)

### 1. Sơ đồ Kiến trúc Tổng quan
Dự án được xây dựng theo mô hình **MERN Stack** (MongoDB - Express.js - React - Node.js):
```text
[ Browser / Frontend React ] 
      |  (HTTPS Requests qua Domain luvia2411.duckdns.org)
      v
[ Nginx Reverse Proxy trên VPS ] -- (Cổng 80/443)
      |
      v  (Chuyển tiếp ngầm nội bộ vào container Frontend)
[ Frontend Container (Nginx) ] -- (Cổng 8080)
      |
      v  (Proxy các request /api và /uploads sang Backend)
[ Backend Container (Node.js) ] -- (Cổng 3000)
      |
      v  (Mongoose kết nối Cloud Atlas)
[ MongoDB Atlas (Cloud Database) ]
```

### 2. Cấu trúc Thư mục & Trách nhiệm
*   **`FE/` (Frontend React + Vite + TypeScript)**:
    *   `src/app/`: Chứa các cấu hình toàn cục (`config.ts`, `router.tsx` quản lý định tuyến, `providers.tsx`).
    *   `src/components/ui/`: Các UI Component dùng chung (Duck animation, audio preview, particle background...).
    *   `src/features/`: Phân chia module chức năng (`auth/`, `love-page/`, `profile/`, `admin/`). Giúp mã nguồn dễ mở rộng và bảo trì.
    *   `src/services/`: Quản lý API Client (`api.ts`, `axios.ts` xử lý tự động gắn Token xác thực qua Request Interceptor).
    *   `src/store/`: Quản lý trạng thái toàn cục của ứng dụng (như trình phát nhạc `music.store.tsx`).
*   **`BE/` (Backend Node.js + Express + Mongoose)**:
    *   `src/app.js`: Tệp cấu hình khởi chạy Express, cấu hình Middleware (CORS, body parser, static folders) và Global Error Handler.
    *   `src/routes/`: Quản lý định tuyến API (`loveRoute.js`, `userRoutes.js`, `themeRoutes.js`, `musicRoutes.js`...).
    *   `src/controllers/`: Xử lý logic nghiệp vụ, phân tách request/response nhận từ Client.
    *   `src/services/`: Tương tác trực tiếp với Database thông qua Mongoose Model, thực hiện các thuật toán tính toán và xử lý file vật lý.
    *   `src/models/`: Định nghĩa lược đồ dữ liệu (Schema) cho MongoDB.
    *   `src/middleware/`: Các bộ lọc bảo mật (`auth.js` xác thực JWT, `rateLimiter.js` giới hạn tần suất request, `upload.js` cấu hình Multer nhận file).

### 3. Các Giải pháp Bảo mật Đã Vá lỗi (Điểm cộng cực lớn khi phỏng vấn)
1.  **Vá lỗi IDOR (Insecure Direct Object Reference) khi xóa ảnh/nhạc**:
    *   *Lỗ hổng*: Người dùng có thể truyền một danh sách tên ảnh của người khác lên API cập nhật để xóa file trên server.
    *   *Khắc phục*: Trong `updateLoveService`, hệ thống truy vấn thông tin gốc từ database để lập danh sách ảnh sở hữu thực tế của trang đó, sau đó đối chiếu chéo trước khi xóa file vật lý bằng `fs.unlink`.
2.  **Chống Brute-Force mật khẩu và mã PIN**:
    *   *Khắc phục*: Tích hợp `express-rate-limit`. Giới hạn tối đa 15 request đăng nhập/đăng ký trong 15 phút, và tối đa 5 lần nhập sai mã PIN trang kỷ niệm trong 15 phút để bảo vệ dữ liệu người dùng.
3.  **Bộ lọc định dạng file nâng cao (Multer Extension Whitelist)**:
    *   *Khắc phục*: Kiểm tra kép cả `mimetype` và phần mở rộng của file (`path.extname`) đối chiếu với danh sách cho phép (`.png`, `.jpg`, `.jpeg`, `.webp`, `.mp3`, `.wav`) để ngăn chặn việc đổi đuôi file mã độc (ví dụ file shell `.php` đổi tên thành `.png`) tải lên server.
4.  **Chống tấn công XSS (Cross-Site Scripting)**:
    *   *Khắc phục*: Escape toàn bộ dữ liệu người dùng nhập (`page.title`, `recipient`, `messages`) bằng hàm xử lý ký tự đặc biệt (`escapeHtml`) trước khi render ra giao diện HTML tĩnh ở Share Page.
5.  **Dọn dẹp tài nguyên (Disk Space Leak Prevention)**:
    *   *Khắc phục*: Khi xóa hoặc cập nhật ảnh/nhạc ở Theme, Music hay Love Page, hệ thống tự động tìm và xóa tệp tin vật lý cũ tương ứng trên đĩa cứng, tránh tình trạng đầy ổ cứng máy chủ (Disk Leak).

---

## PHẦN 2: HẠ TẦNG TRIỂN KHAI & CÔNG CỤ DEVOPS (TẠI SAO & MỤC ĐÍCH?)

Khi phỏng vấn, bạn cần giải thích rõ lý do lựa chọn bộ công cụ này:

### 1. Docker
*   **Tại sao dùng?**: Để giải quyết vấn đề bất nhất môi trường. Ứng dụng chạy trên Windows của lập trình viên thế nào thì khi đưa lên VPS Ubuntu sẽ chạy y hệt như vậy, không bị lỗi thiếu thư viện hay lệch phiên bản Node.js.
*   **Mục đích**: Đóng gói mã nguồn cùng toàn bộ dependencies (như Node.js 20, Nginx) thành một đơn vị duy nhất gọi là **Image** và khởi chạy cô lập trong **Container**.
*   **Cơ chế hoạt động**: 
    *   Backend Dockerfile: Tải Node.js Alpine (bản rút gọn siêu nhẹ), copy source code, chạy `npm install --production` để bỏ qua devDependencies giúp tối ưu dung lượng image.
    *   Frontend Dockerfile (2-Stage build): Stage 1 sử dụng Node để build React thành mã tĩnh HTML/JS. Stage 2 ném toàn bộ Node đi, chỉ giữ lại file tĩnh đưa vào container Nginx để phục vụ người dùng. Điều này giảm kích thước image từ 1GB xuống 25MB.

### 2. Docker Compose
*   **Tại sao dùng?**: Thay vì phải gõ hàng chục lệnh cấu hình mạng (Network), ánh xạ thư mục (Volume), thiết lập cổng (Port) cho từng container Backend và Frontend riêng lẻ.
*   **Mục đích**: Công cụ quản lý đa container bằng một file cấu hình duy nhất `docker-compose.yml`.
*   **Cơ chế hoạt động**:
    *   Tự động tạo ra một mạng nội bộ chung (`luvia_network`) để các container tự nói chuyện với nhau bằng tên (ví dụ: Frontend Nginx proxy trực tiếp tới `http://backend:3000`).
    *   **Volume Mapping (`./uploads:/app/uploads`)**: Đồng bộ thư mục lưu tệp trong container backend ra ngoài ổ đĩa vật lý của VPS. Dù container có bị tắt, nâng cấp hay xóa đi, dữ liệu ảnh/nhạc của người dùng vẫn được bảo toàn.

### 3. Nginx trên VPS Host (Reverse Proxy)
*   **Tại sao dùng?**: Mặc định máy chủ Docker chạy trên cổng `8080` (Frontend) và cổng `3000` (Backend). Nhưng người dùng trên internet chỉ truy cập qua cổng `80` (HTTP) hoặc `443` (HTTPS) của tên miền.
*   **Mục đích**: Làm máy chủ Web trung gian đón nhận toàn bộ request từ người dùng tên miền `luvia2411.duckdns.org` gửi vào cổng 80/443, sau đó chuyển tiếp ngầm (Reverse Proxy) về cổng `8080` của container Docker Frontend.
*   **Sửa lỗi React Routing (try_files)**: Do React là Single Page Application (SPA), Nginx được cấu hình `try_files $uri $uri/ /index.html` để nếu người dùng nhấn F5 ở trang `/dashboard` hoặc `/page/abc`, Nginx sẽ điều hướng yêu cầu về `index.html` để React xử lý tiếp, tránh lỗi `404 Not Found`.

### 4. Certbot (SSL Let's Encrypt)
*   **Tại sao dùng?**: Các trình duyệt hiện đại như Chrome, Safari chặn các tính năng phát nhạc tự động (Autoplay) hoặc truy cập các API của trình duyệt nếu trang web chạy trên giao thức không an toàn HTTP.
*   **Mục đích**: Tự động xin cấp chứng chỉ bảo mật và cấu hình mã hóa dữ liệu HTTPS hoàn toàn miễn phí từ tổ chức phi lợi nhuận Let's Encrypt. Có cơ chế tự động cấu hình lại Nginx và hẹn giờ gia hạn chứng chỉ tự động.

---

## PHẦN 3: QUY TRÌNH NÂNG CẤP & CẬP NHẬT CODE TRONG TƯƠNG LAI

Sau này khi bạn muốn viết thêm tính năng mới cho dự án Luvia, quy trình DevOps chuẩn sẽ diễn ra như sau:

### Quy trình 4 bước cập nhật mã nguồn lên VPS:
1.  **Phát triển và kiểm tra cục bộ (Local)**:
    *   Viết code tính năng mới ở máy cá nhân. Chạy thử nghiệm bằng `npm run dev` để đảm bảo không lỗi.
2.  **Đẩy mã nguồn lên Git**:
    *   Commit code và push lên GitHub nhánh deploy:
        ```bash
        git add .
        git commit -m "feat: thêm tính năng X"
        git push origin devops/deployment
        ```
3.  **SSH vào máy chủ VPS**:
    *   Mở Terminal kết nối máy chủ VPS:
        ```bash
        ssh zlab@138.252.152.134
        cd Luvia
        ```
4.  **Cập nhật và Rebuild container trên VPS**:
    *   Kéo code mới nhất từ GitHub về máy chủ:
        ```bash
        git pull
        ```
    *   Dùng Docker Compose để tự động build lại image mới và khởi chạy đè lên container cũ (Zero-Downtime deployment):
        ```bash
        docker compose up --build -d
        ```
        *Docker sẽ tự động phát hiện file nào thay đổi để build lại, các phần không thay đổi (như node_modules) sẽ được lấy từ cache giúp quá trình cập nhật chỉ mất vài chục giây.*

---

## PHẦN 4: BÍ QUYẾT TRẢ LỜI PHỎNG VẤN FULL STACK TỪ DỰ ÁN NÀY

### Câu hỏi 1: "Bạn đã bảo mật cho dự án của mình như thế nào?"
*   **Cách trả lời**: "Trong dự án này, em tập trung giải quyết 3 lỗi bảo mật phổ biến là IDOR, XSS và Brute-Force. Cụ thể, với IDOR ở chức năng xóa file, em không tin cậy danh sách file Client gửi lên mà truy vấn danh sách file thực tế thuộc quyền sở hữu của trang đó từ Database trước khi xóa vật lý. Để chống Brute-Force mã PIN và mật khẩu, em tích hợp `express-rate-limit` giới hạn tần suất request. Đối với XSS ở các trang chia sẻ dạng HTML tĩnh, em viết helper `escapeHtml` để lọc sạch dữ liệu đầu vào trước khi render."

### Câu hỏi 2: "Tại sao bạn lại dùng Docker thay vì chạy PM2 trực tiếp trên VPS?"
*   **Cách trả lời**: "Dùng Docker giúp em container hóa ứng dụng, đảm bảo tính nhất quán môi trường 100% giữa máy cá nhân và VPS. Ngoài ra, việc bảo trì nâng cấp rất sạch sẽ: em không cần cài cắm Node.js trực tiếp trên hệ điều hành VPS, tránh làm bẩn hệ thống. Nếu sau này cần scale-up (mở rộng thêm nhiều server), em chỉ cần kéo Docker Image về chạy là xong ngay lập tức."

### Câu hỏi 3: "Bạn xử lý thế nào với các file tĩnh như ảnh/nhạc người dùng upload khi chạy Docker?"
*   **Cách trả lời**: "Mặc định ổ đĩa của container Docker sẽ bị xóa sạch dữ liệu nếu container bị restart hoặc xóa đi. Để giải quyết vấn đề mất mát dữ liệu này, em đã cấu hình **Volume Mapping** trong Docker Compose, liên kết thư mục `/app/uploads` của container Backend trực tiếp ra thư mục `./uploads` vật lý của máy chủ VPS. Nhờ đó dữ liệu được bảo toàn vĩnh viễn và dễ dàng thực hiện sao lưu (Backup) định kỳ."
