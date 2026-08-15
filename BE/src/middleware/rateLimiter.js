import rateLimit from "express-rate-limit";

// Giới hạn tần suất đăng ký / đăng nhập để chống brute-force mật khẩu
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 15, // Tối đa 15 lần thử từ cùng một IP
    message: {
        success: false,
        message: "Bạn đã thao tác quá nhanh hoặc thử quá nhiều lần. Vui lòng thử lại sau 15 phút."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Giới hạn tần suất mở khóa PIN để chống dò mã PIN
export const pinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Tối đa 5 lần nhập PIN sai từ cùng một IP
    message: {
        success: false,
        message: "Nhập sai mã PIN quá nhiều lần. Vui lòng thử lại sau 15 phút."
    },
    standardHeaders: true,
    legacyHeaders: false,
});
