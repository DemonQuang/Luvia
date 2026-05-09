import Love from "../models/love.js";
import bcrypt from "bcrypt";


// CREATE
const createLoveService = async (userId, data) => {

    const {
        title,
        pin,
        theme = "cute",
        content = {}
    } = data;

    // Validate
    if (!title || !pin) {
        throw new Error("Title và PIN là bắt buộc");
    }

    // Kiểm tra độ dài PIN
    if (pin.length < 4) {
        throw new Error("PIN phải từ 4 ký tự");
    }

    // Random slug
    let slug;
    let existingSlug;

    do {

        slug = Math.random()
            .toString(36)
            .substring(2, 8);

        existingSlug = await Love.findOne({ slug });

    } while (existingSlug);

    // Hash pin
    const pinHash = await bcrypt.hash(pin, 10);

    // Create page
    const page = await Love.create({

        userId: userId,

        title: title.trim(),

        slug,

        pinHash,

        theme,

        content: {
            messages: content.messages || [],
            images: content.images || [],
            music: content.music || ""
        }
    });

    return page;
};


// GET ALL
const getAllLoveService = async () => {

    const data = await Love.find()
        .select("-pinHash")
        .sort({ createdAt: -1 });

    return data;
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
        content
    } = data;

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

    if (content) {

        page.content.messages =
            content.messages || page.content.messages;


        page.content.images =
            content.images || page.content.images;

        page.content.music =
            content.music || page.content.music;
    }

    // Save DB
    await page.save();

    return {
        status: 200,
        data: page
    };
};


// DELETE
const deleteLoveService = async (id) => {

    const page = await Love.findById(id);

    if (!page) {
        return null;
    }

    await page.deleteOne();

    return page;
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