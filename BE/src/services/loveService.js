import Love from "../models/love.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import crypto from "crypto";


const deleteFileByUrl = (url) => {
    if (!url) return;
    try {
        const filename = url.substring(url.lastIndexOf("/") + 1);
        const filePath = path.join("uploads", filename);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`[Cleanup] Lỗi khi xóa file ${filePath}:`, err);
                else console.log(`[Cleanup] Đã xóa file ${filePath} thành công`);
            });
        }
    } catch (error) {
        console.error("[Cleanup] Lỗi khi xóa file bằng URL:", error);
    }
};


// CREATE
const createLoveService = async (
    userId,
    data) => {
    const {
        title,
        pin,
        theme = "cute",
        recipientType = "OTHER",
        occasion = "OTHER",
        status = "PUBLISHED",
        content = {}
    } = data;

    // Validate
    if (!title || !pin) {
        throw new Error(
            "Title và PIN là bắt buộc"
        );
    }

    // Validate PIN
    if (String(pin).length < 4) {
        throw new Error(
            "PIN phải từ 4 ký tự"
        );
    }

    // Random slug using UUID segment (8 characters)
    let slug;
    let existingSlug;
    do {
        slug = crypto.randomUUID().split('-')[0];
        existingSlug =
            await Love.findOne({ slug });
    } while (existingSlug);

    // Hash PIN
    const pinHash = await bcrypt.hash(String(pin), 10);

    // Create page
    const page = await Love.create({
        userId,
        title: String(title).trim(),
        slug,
        pinHash,
        theme,
        recipientType,
        occasion,
        status,
        content: {
            messages:
                content.messages ?? [],
            images:
                content.images ?? [],
            mainImage:
                content.mainImage ?? "",
            layout:
                content.layout ?? "",
            background:
                content.background ?? "",
            primaryColor:
                content.primaryColor ?? "",
            secondaryColor:
                content.secondaryColor ?? "",
            music:
                content.music ?? "",
            recipient:
                content.recipient ?? "",
            occasion:
                content.occasion ?? ""
        }
    });
    return page;
};


// GET ALL
const getAllLoveService = async (
    userId
) => {
    return await Love.find({
        userId
    })
        .select("-pinHash")
        .sort({ createdAt: -1 });
};

// GET BY SLUG
const getLoveBySlugService = async (slug) => {

    const page = await Love.findOne({ slug })
        .select("-pinHash");

    return page;
};


// UPDATE
const updateLoveService = async (
    id,
    userId,
    data
) => {

    const {
        title,
        theme,
        recipientType,
        occasion,
        status,
        content,
        pin,
        imageUrls = [],
        musicUrl = ""
    } = data;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
            status: 400,
            message: "ID không hợp lệ"
        };
    }

    // Tìm page
    const page = await Love.findById(id);

    // Không tồn tại
    if (!page) {
        return {
            status: 404,
            message: "Không tìm thấy trang"
        };
    }

    // Check owner
    if (page.userId.toString() !== userId) {
        return {
            status: 403,
            message: "Không có quyền"
        };
    }

    // Update
    page.title = title || page.title;
    page.theme = theme || page.theme;
    if (recipientType) page.recipientType = recipientType;
    if (occasion) page.occasion = occasion;
    if (status) page.status = status;

    if (pin) {
        if (String(pin).length < 4) {
            throw new Error("PIN phải từ 4 ký tự");
        }
        page.pinHash = await bcrypt.hash(String(pin), 10);
    }

    if (content) {
        // Compare and delete removed images from disk safely
        if (content.images !== undefined) {
            const oldImages = page.content.images || [];
            // Chỉ giữ lại ảnh cũ thuộc về page HOẶC ảnh mới vừa upload trong request này
            const safeExistingImages = content.images.filter(img => oldImages.includes(img));
            const finalImages = [...safeExistingImages, ...imageUrls];

            const deletedImages = oldImages.filter(img => !finalImages.includes(img));
            deletedImages.forEach(img => deleteFileByUrl(img));
            page.content.images = finalImages;
        }

        // Compare and delete removed music from disk safely
        if (content.music !== undefined) {
            const oldMusic = page.content.music;
            let finalMusic = "";
            if (musicUrl) {
                finalMusic = musicUrl; // dùng nhạc mới upload
            } else if (content.music === oldMusic) {
                finalMusic = oldMusic; // giữ nhạc cũ
            } else {
                finalMusic = ""; // xóa nhạc
            }

            if (oldMusic && oldMusic !== finalMusic) {
                deleteFileByUrl(oldMusic);
            }
            page.content.music = finalMusic;
        }

        if (content.messages !== undefined) {
            page.content.messages = content.messages;
        }

        if (content.mainImage !== undefined) {
            // Đảm bảo mainImage phải nằm trong danh sách ảnh hợp lệ của trang
            if (page.content.images.includes(content.mainImage)) {
                page.content.mainImage = content.mainImage;
            } else {
                page.content.mainImage = page.content.images[0] || "";
            }
        }
        if (content.layout !== undefined) {
            page.content.layout = content.layout;
        }
        if (content.background !== undefined) {
            page.content.background = content.background;
        }
        if (content.primaryColor !== undefined) {
            page.content.primaryColor = content.primaryColor;
        }
        if (content.secondaryColor !== undefined) {
            page.content.secondaryColor = content.secondaryColor;
        }

        page.content.recipient =
            content.recipient !== undefined ? content.recipient : page.content.recipient;

        page.content.occasion =
            content.occasion !== undefined ? content.occasion : page.content.occasion;
    }

    // Save DB
    await page.save();

    return {
        status: 200,
        data: page
    };
};


// DELETE
const deleteLoveService = async (
    id,
    userId) => {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
            status: 400,
            message: "ID không hợp lệ"
        };
    }

    // Tìm page
    const page = await Love.findById(id);
    // Không tồn tại
    if (!page) {
        return {
            status: 404,
            message: "Không tìm thấy trang"
        };
    }

    // Không phải chủ sở hữu
    if (
        page.userId.toString() !== userId
    ) {
        return {
            status: 403,
            message:
                "Bạn không có quyền xóa trang này"
        };
    }

    // Xóa tất cả ảnh của page trên disk
    if (page.content && page.content.images) {
        page.content.images.forEach(img => deleteFileByUrl(img));
    }
    // Xóa nhạc của page trên disk
    if (page.content && page.content.music) {
        deleteFileByUrl(page.content.music);
    }

    // Xóa page
    await page.deleteOne();
    return {
        status: 200,
        message: "Xóa thành công"
    };
};


// VERIFY PIN
const verifyPinService = async (slug, pin) => {

    const page = await Love.findOne({ slug })
        .select("+pinHash");

    if (!page) {
        return null;
    }

    const isMatch = await bcrypt.compare(
        pin,
        page.pinHash
    );

    return isMatch;
};


// INCREASE VIEW
const increaseViewsService = async (slug) => {

    const page = await Love.findOneAndUpdate(
        { slug },

        {
            $inc: {
                views: 1
            }
        },

        {
            new: true
        }
    );

    return page;
};


export {
    createLoveService,
    getAllLoveService,
    getLoveBySlugService,
    updateLoveService,
    deleteLoveService,
    verifyPinService,
    increaseViewsService
};