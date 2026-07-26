import jwt from "jsonwebtoken";

// Middleware dùng để kiểm tra JWT token
export const verifyToken = (req, res, next) => {
    // Dùng try catch để bắt lỗi khi verify token
    try {
        // Lấy Authorization header từ request
        // Ví dụ:
        // Authorization: Bearer abcxyz123
        const authHeader = req.headers.authorization;
        // Kiểm tra:
        // 1. Có gửi token không
        // 2. Có đúng format "Bearer token" không
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // Nếu không có token -> trả lỗi 401 Unauthorized
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }
        // Tách token ra khỏi chuỗi "Bearer "
        // Ví dụ:
        // "Bearer abc123".split(" ")
        // => ["Bearer", "abc123"]
        // lấy phần tử thứ 2 là token

        const token = authHeader.split(" ")[1];
        // Verify token bằng JWT_SECRET
        // jwt.verify sẽ:
        // - kiểm tra token có hợp lệ không
        // - kiểm tra token có bị sửa không
        // - kiểm tra token có hết hạn chưa
        // - giải mã payload bên trong token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Lưu thông tin decoded vào req.user
        // để controller sau có thể dùng
        // Ví dụ:
        // req.user.id
        // req.user.role
        req.user = decoded;

        // Token hợp lệ -> cho request đi tiếp
        next();

    } catch (error) {

        // Nếu token:
        // - sai
        // - hết hạn
        // - giả mạo
        // - malformed
        // thì sẽ vào đây
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

// Middleware kiểm tra quyền admin
export const isAdmin = (req, res, next) => {

    // Kiểm tra role của user
    // req.user được gắn từ middleware verifyToken trước đó
    // Ví dụ:
    // req.user = {
    //    id: "123",
    //    role: "user"
    // }

    // Nếu role KHÔNG phải admin
    if (req.user.role !== "admin") {

        // Trả lỗi 403 Forbidden
        // Nghĩa là:
        // "Bạn đã đăng nhập nhưng không có quyền truy cập"
        return res.status(403).json({
            success: false,
            message: "Admin access only"
        });
    }

    // Nếu đúng admin -> cho đi tiếp
    next();
};