import Love from "../models/love.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";


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

    // Random slug
    let slug;
    let existingSlug;
    do {
        slug = Math.random()
            .toString(36)
            .substring(2, 8);
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
        content: {
            messages:
                content.messages ?? [],
            images:
                content.images ?? [],
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
        content,
        pin
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

    if (pin) {
        if (String(pin).length < 4) {
            throw new Error("PIN phải từ 4 ký tự");
        }
        page.pinHash = await bcrypt.hash(String(pin), 10);
    }

    if (content) {
        // Compare and delete removed images from disk
        if (content.images !== undefined) {
            const oldImages = page.content.images || [];
            const newImages = content.images || [];
            const deletedImages = oldImages.filter(img => !newImages.includes(img));
            deletedImages.forEach(img => deleteFileByUrl(img));
            page.content.images = newImages;
        }

        // Compare and delete removed music from disk
        if (content.music !== undefined) {
            const oldMusic = page.content.music;
            const newMusic = content.music;
            if (oldMusic && oldMusic !== newMusic) {
                deleteFileByUrl(oldMusic);
            }
            page.content.music = newMusic;
        }

        if (content.messages !== undefined) {
            page.content.messages = content.messages;
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