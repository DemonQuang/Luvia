import {
    createLoveService,
    getAllLoveService,
    getLoveBySlugService,
    updateLoveService,
    deleteLoveService,
    verifyPinService,
    increaseViewsService
} from "../services/loveService.js";
import jwt from "jsonwebtoken";

// CREATE
const createLove = async (req, res) => {
    try {

        const imageUrls =
            req.files?.images?.map(
                (file) =>
                    `${process.env.BASE_URL}/uploads/${file.filename}`
            ) || [];

        const musicUrl =
            req.files?.music?.[0]
                ? `${process.env.BASE_URL}/uploads/${req.files.music[0].filename}`
                : "";

        let content = {};
        try {
            if (req.body.content) {
                content = JSON.parse(req.body.content);
            }
        } catch {
            return res.status(400).json({
                success: false,
                message: "Content JSON không hợp lệ"
            });
        }
        let finalImages = imageUrls;
        if (content.mainImage) {
            if (content.mainImage === 'new_first' && imageUrls.length > 0) {
                const mainUrl = imageUrls[0];
                const idx = finalImages.indexOf(mainUrl);
                if (idx > -1) {
                    const [mainImg] = finalImages.splice(idx, 1);
                    finalImages.unshift(mainImg);
                }
                content.mainImage = finalImages[0];
            } else {
                const idx = finalImages.indexOf(content.mainImage);
                if (idx > -1) {
                    const [mainImg] = finalImages.splice(idx, 1);
                    finalImages.unshift(mainImg);
                }
            }
        } else {
            content.mainImage = "";
        }
        content.images = finalImages;
        content.music = musicUrl || content.music || "";
        const data = {
            ...req.body,
            content
        };
        const page = await createLoveService(
            req.user.id,
            data
        );
        res.status(201).json({
            success: true,
            message: "Tạo trang thành công",
            data: page
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

        const data = await getAllLoveService(req.user.id);

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

        // Lấy token
        const authHeader =
            req.headers.authorization;

        // Không có token
        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({
                success: false,
                message: "PIN required"
            });
        }

        // Tách token
        const token =
            authHeader.split(" ")[1];

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        } catch {

            return res.status(401).json({
                success: false,
                message: "Token không hợp lệ"
            });
        }

        // Check slug đúng không
        console.log("[DEBUG] getLoveBySlug -> decoded:", decoded);
        console.log("[DEBUG] getLoveBySlug -> params slug:", slug);
        console.log("[DEBUG] getLoveBySlug -> comparison:", decoded.slug === slug);
        if (decoded.slug !== slug) {

            return res.status(403).json({
                success: false,
                message: "Không có quyền truy cập"
            });
        }

        // Lấy page
        const page =
            await getLoveBySlugService(slug);

        // Không có page
        if (!page) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy trang"
            });
        }

        // Success
        res.status(200).json({
            success: true,
            data: page
        });

    } catch (error) {

        console.error(
            "Get Love By Slug Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE
const updateLove = async (req, res) => {

    try {

        const imageUrls =
            req.files?.images?.map(
                (file) =>
                    `${process.env.BASE_URL}/uploads/${file.filename}`
            ) || [];

        const musicUrl =
            req.files?.music?.[0]
                ? `${process.env.BASE_URL}/uploads/${req.files.music[0].filename}`
                : "";

        let content;
        try {
            if (req.body.content) {
                content = JSON.parse(req.body.content);
            }
        } catch {
            return res.status(400).json({
                success: false,
                message: "Content JSON không hợp lệ"
            });
        }

        if (!content) {
            content = {};
        }

        // Combine existing images (that were kept) and new images (that were uploaded)
        const existingImages = content.existingImages || [];
        let finalImages = [...existingImages, ...imageUrls];

        if (content.mainImage) {
            if (content.mainImage === 'new_first' && imageUrls.length > 0) {
                const mainUrl = imageUrls[0];
                const idx = finalImages.indexOf(mainUrl);
                if (idx > -1) {
                    const [mainImg] = finalImages.splice(idx, 1);
                    finalImages.unshift(mainImg);
                }
                content.mainImage = finalImages[0];
            } else {
                const idx = finalImages.indexOf(content.mainImage);
                if (idx > -1) {
                    const [mainImg] = finalImages.splice(idx, 1);
                    finalImages.unshift(mainImg);
                }
            }
        } else {
            content.mainImage = "";
        }
        content.images = finalImages;

        // Combine music: use newly uploaded music if available, otherwise fallback to existing music
        const existingMusic = content.existingMusic || "";
        content.music = musicUrl || content.music || existingMusic;

        const data = { ...req.body, content, imageUrls, musicUrl };

        const result = await updateLoveService(
            req.params.id,
            req.user.id,
            data
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

        const result = await deleteLoveService(

            req.params.id,

            req.user.id
        );

        return res.status(result.status).json({

            success: result.status === 200,

            message: result.message
        });

    } catch (error) {

        console.error(
            "Delete Love Error:",
            error
        );

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

        // Không tìm thấy page
        if (isMatch === null) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy trang"
            });
        }

        // Sai pin
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "PIN không đúng"
            });
        }

        // Tạo access token cho page
        const accessToken = jwt.sign(

            {
                slug,
                access: true
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1h"
            }
        );

        // Success
        res.status(200).json({
            success: true,
            message: "Xác thực thành công",

            accessToken
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
    increaseViews,
};