import {
    createLoveService,
    getAllLoveService,
    getLoveBySlugService,
    updateLoveService,
    deleteLoveService,
    verifyPinService,
    increaseViewsService
} from "../services/loveService.js";


// CREATE
const createLove = async (req, res) => {
    try {

        const page = await createLoveService(
            req.user.id,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Tạo trang thành công",

            data: {
                _id: page._id,
                title: page.title,
                slug: page.slug,
                theme: page.theme,
                content: page.content,
                views: page.views,
                createdAt: page.createdAt
            }
        });

    } catch (error) {

        console.error("Create Love Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET ALL
const getAllLove = async (req, res) => {
    try {

        const data = await getAllLoveService();

        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu thành công",
            total: data.length,
            data
        });

    } catch (error) {

        console.error("Get All Love Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET BY SLUG
const getLoveBySlug = async (req, res) => {
    try {

        const { slug } = req.params;

        const page = await getLoveBySlugService(slug);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy trang"
            });
        }

        res.status(200).json({
            success: true,
            data: page
        });

    } catch (error) {

        console.error("Get Love By Slug Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE
const updateLove = async (req, res) => {

    try {

        const result = await updateLoveService(
            req.params.id,
            req.user.id,
            req.body
        );

        return res.status(result.status).json({
            success: result.status === 200,
            message: result.message,
            data: result.data
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE
const deleteLove = async (req, res) => {
    try {

        const { id } = req.params;

        const page = await deleteLoveService(id);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy trang"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa thành công"
        });

    } catch (error) {

        console.error("Delete Love Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// VERIFY PIN
const verifyPin = async (req, res) => {
    try {

        const { slug, pin } = req.body;

        if (!slug || !pin) {
            return res.status(400).json({
                success: false,
                message: "Thiếu slug hoặc pin"
            });
        }

        const isMatch = await verifyPinService(
            slug,
            pin
        );

        if (isMatch === null) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy trang"
            });
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "PIN không đúng"
            });
        }

        res.status(200).json({
            success: true,
            message: "Xác thực thành công"
        });

    } catch (error) {

        console.error("Verify Pin Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// INCREASE VIEW
const increaseViews = async (req, res) => {
    try {

        const { slug } = req.params;

        const page = await increaseViewsService(slug);

        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy trang"
            });
        }

        res.status(200).json({
            success: true,
            message: "Tăng view thành công",
            views: page.views
        });

    } catch (error) {

        console.error("Increase View Error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export {
    createLove,
    getAllLove,
    getLoveBySlug,
    updateLove,
    deleteLove,
    verifyPin,
    increaseViews
};