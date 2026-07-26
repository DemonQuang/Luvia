# Luvia — API Documentation

## Tổng quan

**Luvia** là ứng dụng cho phép người dùng tạo các **trang tỏ tình/love page** với ảnh, nhạc và bảo vệ bằng PIN. Người nhận cần nhập đúng PIN mới xem được nội dung.

### Thông tin server

| Property | Value |
|---|---|
| Base URL | `http://localhost:3000/api` |
| Uploads | `http://localhost:3000/uploads/...` |
| Auth Type | JWT (Bearer token) |
| Content-Type | `application/json` hoặc `multipart/form-data` |

---

## Models (Database)

### User

```json
{
  "_id": "ObjectId",
  "fullname": "String (required)",
  "username": "String (required, unique)",
  "email": "String (required, unique, lowercase)",
  "password": "String (required, hashed, select: false)",
  "role": "String (enum: 'admin' | 'user', default: 'user')",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Love Page

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User)",
  "title": "String (required, maxlength: 100)",
  "slug": "String (required, unique, lowercase, 6 ký tự random)",
  "pinHash": "String (required, hashed, select: false)",
  "theme": "String (enum: 'cute' | 'romantic' | 'dark', default: 'cute')",
  "content": {
    "messages": ["String ..."],
    "images": ["String (URL) ..."],
    "music": "String (URL)"
  },
  "views": "Number (default: 0)",
  "isPublic": "Boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Authentication

### Flow

```
1. Register  → nhận user info
2. Login     → nhận JWT token (7 ngày)
3. Gửi token trong header: Authorization: Bearer <token>
```

### 1. Đăng ký

```
POST /auth/register
Content-Type: application/json
Auth: ❌ (public)
```

**Request Body:**

```json
{
  "fullname": "Nguyễn Văn A",
  "username": "nguyenvana",
  "email": "vana@example.com",
  "password": "123456"
}
```

**Validation:**
- All fields required
- Email phải đúng định dạng
- Password ≥ 6 ký tự
- Username + Email không được trùng

**Response (201):**

```json
{
  "success": true,
  "message": "Register success",
  "user": {
    "id": "660abc...",
    "fullname": "Nguyễn Văn A",
    "username": "nguyenvana",
    "email": "vana@example.com",
    "role": "user"
  }
}
```

**Errors:**
| Status | Message |
|---|---|
| 400 | "Please fill all fields" |
| 400 | "Invalid email" |
| 400 | "Password must be at least 6 characters" |
| 409 | "Username already exists" |
| 409 | "Email already exists" |

---

### 2. Đăng nhập

```
POST /auth/login
Content-Type: application/json
Auth: ❌ (public)
```

**Request Body:**

```json
{
  "usernameOrEmail": "nguyenvana",
  "password": "123456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "660abc...",
    "fullname": "Nguyễn Văn A",
    "username": "nguyenvana",
    "email": "vana@example.com",
    "role": "user"
  }
}
```

**JWT Payload:** `{ id: "ObjectId", role: "user" }` — hết hạn sau 7 ngày

**Lưu ý:** `token` này dùng để gọi các API cần auth (tạo page, sửa page, dashboard, admin).

**Errors:**
| Status | Message |
|---|---|
| 400 | "Username/email and password required" |
| 404 | "User not found" |
| 401 | "Invalid password" |

---

## Love Pages

### 3. Lấy danh sách trang của user

```
GET /loves
Auth: ✅ (Bearer token từ login)
```

**Response (200):**

```json
{
  "success": true,
  "message": "Lấy dữ liệu thành công",
  "total": 2,
  "data": [
    {
      "_id": "660abc...",
      "userId": "660abc...",
      "title": "Gửi em ❤️",
      "slug": "a3x9k2",
      "theme": "cute",
      "content": {
        "messages": ["Anh yêu em!", "Em là cả thế giới của anh"],
        "images": ["http://localhost:3000/uploads/1712345678-123456789.jpg"],
        "music": "http://localhost:3000/uploads/1712345678-987654321.mp3"
      },
      "views": 42,
      "isPublic": false,
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 4. Tạo love page mới

```
POST /loves
Auth: ✅ (Bearer token từ login)
Content-Type: multipart/form-data
```

**Form Data:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | ✅ | Tiêu đề trang |
| `pin` | text | ✅ | PIN ≥ 4 ký tự |
| `theme` | text | ❌ | `cute` | `romantic` | `dark` (mặc định: `cute`) |
| `content` | text (JSON) | ❌ | `{"messages": ["Dòng 1", "Dòng 2"]}` |
| `images` | file (multiple) | ❌ | Tối đa 10 file, định dạng: png/jpg/jpeg/webp |
| `music` | file (single) | ❌ | 1 file, định dạng: mp3/wav |

**Giới hạn:** mỗi file tối đa 20MB.

**Response (201):**

```json
{
  "success": true,
  "message": "Tạo trang thành công",
  "data": {
    "_id": "660abc...",
    "userId": "660abc...",
    "title": "Gửi em ❤️",
    "slug": "a3x9k2",
    "theme": "cute",
    "content": {
      "messages": ["Anh yêu em!"],
      "images": ["http://localhost:3000/uploads/1712345678-123456789.jpg"],
      "music": "http://localhost:3000/uploads/1712345678-987654321.mp3"
    },
    "views": 0,
    "isPublic": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**
| Status | Message |
|---|---|
| 400 | "Content JSON không hợp lệ" |
| 500 | "Title và PIN là bắt buộc" |
| 500 | "PIN phải từ 4 ký tự" |

---

### 5. Xem love page (cần PIN token)

```
GET /loves/page/:slug
Auth: ✅ (Bearer token từ verify-pin)
```

**Headers:**
```
Authorization: Bearer <accessToken từ verify-pin>
```

**Params:** `slug` — mã 6 ký tự của page (ví dụ: `a3x9k2`)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "660abc...",
    "userId": "660abc...",
    "title": "Gửi em ❤️",
    "slug": "a3x9k2",
    "theme": "cute",
    "content": {
      "messages": ["Anh yêu em!"],
      "images": ["http://localhost:3000/uploads/1712345678-123456789.jpg"],
      "music": "http://localhost:3000/uploads/1712345678-987654321.mp3"
    },
    "views": 43,
    "isPublic": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**
| Status | Message |
|---|---|
| 401 | "PIN required" — chưa gửi token |
| 401 | "Token không hợp lệ" — token sai/hết hạn |
| 403 | "Không có quyền truy cập" — slug trong token không khớp |
| 404 | "Không tìm thấy trang" |

---

### 6. Xác thực PIN

```
POST /loves/verify-pin
Content-Type: application/json
Auth: ❌ (public)
```

**Request Body:**

```json
{
  "slug": "a3x9k2",
  "pin": "1234"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Xác thực thành công",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**JWT Payload:** `{ slug: "a3x9k2", access: true }` — hết hạn sau 1 giờ

**Lưu ý:** `accessToken` này dùng để gọi `GET /loves/page/:slug`.

**Errors:**
| Status | Message |
|---|---|
| 400 | "Thiếu slug hoặc pin" |
| 404 | "Không tìm thấy trang" |
| 401 | "PIN không đúng" |

---

### 7. Tăng lượt xem

```
PATCH /loves/:slug/view
Auth: ❌ (public)
```

**Params:** `slug` — mã 6 ký tự của page

**Response (200):**

```json
{
  "success": true,
  "message": "Tăng view thành công",
  "views": 44
}
```

---

### 8. Cập nhật love page

```
PUT /loves/:id
Auth: ✅ (Bearer token từ login)
Content-Type: multipart/form-data
```

**Params:** `id` — `_id` của love page (ObjectId)

**Form Data:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | text | ❌ | Để trống nếu không đổi |
| `pin` | text | ❌ | PIN mới, để trống nếu không đổi |
| `theme` | text | ❌ | `cute` | `romantic` | `dark` |
| `content` | text (JSON) | ❌ | `{"messages": ["Dòng mới"]}` |
| `images` | file (multiple) | ❌ | Upload ảnh mới (ghi đè ảnh cũ) |
| `music` | file (single) | ❌ | Upload nhạc mới |

**Response (200):**

```json
{
  "success": true,
  "message": "Cập nhật thành công",
  "data": {
    "_id": "660abc...",
    "title": "Tiêu đề mới",
    ...
  }
}
```

**Errors:**
| Status | Message |
|---|---|
| 400 | "ID không hợp lệ" |
| 400 | "Content JSON không hợp lệ" |
| 403 | "Không có quyền" — không phải chủ sở hữu |
| 404 | "Không tìm thấy trang" |
| 500 | "Chỉ cho phép upload ảnh hoặc nhạc" |

---

### 9. Xóa love page

```
DELETE /loves/:id
Auth: ✅ (Bearer token từ login)
```

**Params:** `id` — `_id` của love page

**Response (200):**

```json
{
  "success": true,
  "message": "Xóa thành công"
}
```

**Errors:**
| Status | Message |
|---|---|
| 400 | "ID không hợp lệ" |
| 403 | "Bạn không có quyền xóa trang này" |
| 404 | "Không tìm thấy trang" |

---

## Admin

### 10. Danh sách người dùng

```
GET /auth/admin/users
Auth: ✅ (Bearer token, role: admin)
```

**Response (200):**

```json
{
  "success": true,
  "users": [
    {
      "_id": "660abc...",
      "fullname": "Nguyễn Văn A",
      "username": "nguyenvana",
      "email": "vana@example.com",
      "role": "user",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

### 11. Xóa người dùng

```
DELETE /auth/admin/users/:id
Auth: ✅ (Bearer token, role: admin)
```

**Params:** `id` — `_id` của user

**Response (200):**

```json
{
  "success": true,
  "message": "Delete success"
}
```

**Errors:**
| Status | Message |
|---|---|
| 404 | "User not found" |

---

## File Upload

### Upload Middleware

| Property | Value |
|---|---|
| Storage | Disk (thư mục `BE/uploads/`) |
| Filename | `timestamp-random.ext` (VD: `1712345678-123456789.jpg`) |
| Image formats | png, jpeg, jpg, webp |
| Audio formats | mpeg, mp3, wav |
| Max file size | 20MB |
| Image max count | 10 files |
| Music max count | 1 file |

### Truy cập file upload

```
http://localhost:3000/uploads/<filename>
```

---

## Flow tổng thể

### Luồng chính — Tạo & Xem Love Page

```
[User]                          [Server]                     [Recipient]
  │                                │                             │
  │── POST /auth/register ──────►  │                             │
  │◄── { user } ─────────────────  │                             │
  │                                │                             │
  │── POST /auth/login ──────────► │                             │
  │◄── { token, user } ──────────  │                             │
  │                                │                             │
  │── POST /loves (multipart) ───► │                             │
  │   (title + pin + ảnh + nhạc)   │                             │
  │◄── { data: lovePage } ───────  │                             │
  │                                │                             │
  │ Gửi link cho recipient         │                             │
  │ ───────────────────────────────────────────────────────►     │
  │                                │                             │
  │                                │   ── POST /verify-pin ───►  │
  │                                │   ◄── { accessToken } ────  │
  │                                │                             │
  │                                │   ── GET /page/:slug ────►  │
  │                                │   (Authorization: Bearer)   │
  │                                │   ◄── { data: page } ─────  │
```

### Luồng Auth

```
                    ┌─────────────────┐
                    │   Chưa đăng nhập │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
      POST /auth/register           POST /auth/login
      { fullname, username,         { usernameOrEmail,
        email, password }              password }
              │                              │
              ▼                              ▼
        201 Created ✅                  200 OK ✅
    { user } (ko password)        { token (7d), user }
                                         │
                                         ▼
                              Lưu vào localStorage
                              Gửi trong header:
                              Authorization: Bearer <token>
```

### Luồng Love Page

```
                    ┌─────────────────┐
                    │ Đã đăng nhập      │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    ▼                  ▼
            GET /loves           POST /loves
          (danh sách)        (tạo mới, multipart)
                    │                  │
                    ▼                  ▼
          Danh sách page ✅      201 Created ✅
                                 { slug: "a3x9k2" }
                                        │
                              Gửi link cho người nhận
                              ─── https://.../page/a3x9k2
                                        │
                    ┌───────────────────┴───────────┐
                    ▼                               ▼
          POST /loves/verify-pin           Nhập sai PIN
          { slug, pin }                     ─── 401
                    │
                    ▼
          200 OK ✅
          { accessToken (1h) }
                    │
                    ▼
          GET /loves/page/:slug
          Authorization: Bearer <accessToken>
                    │
                    ▼
          200 OK ✅
          { data: page }
          (messages, images, music, theme)
```

---

## HTTP Status Codes

| Code | Ý nghĩa |
|---|---|
| `200` | Thành công |
| `201` | Tạo thành công |
| `400` | Dữ liệu gửi lên không hợp lệ |
| `401` | Chưa đăng nhập / Token sai / PIN sai |
| `403` | Không có quyền (admin, chủ sở hữu) |
| `404` | Không tìm thấy |
| `409` | Trùng username/email |
| `500` | Lỗi server |

## Response Format

**Thành công:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Thất bại:**
```json
{
  "success": false,
  "message": "..."
}
```
