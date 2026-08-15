import multer from "multer";
import path from "path";


// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        // Tạo tên unique
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);
        cb(null, uniqueName);
    }
});


// File filter
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        // IMAGE
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",

        // AUDIO
        "audio/mpeg",
        "audio/mp3",
        "audio/wav"
    ];

    const allowedExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".mp3",
        ".wav"
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    // Check type and extension
    if (
        allowedMimeTypes.includes(file.mimetype) &&
        allowedExtensions.includes(ext)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Chỉ cho phép upload ảnh hoặc nhạc với định dạng hợp lệ (.png, .jpg, .jpeg, .webp, .mp3, .wav)"
            ),
            false
        );
    }
};


// Upload middleware
const upload = multer({
    storage,
    fileFilter,
    limits: {
        // 20MB
        fileSize: 20 * 1024 * 1024
    }
});

export default upload;