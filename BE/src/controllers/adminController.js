import User from "../models/user.js";
import Love from "../models/love.js";
import Theme from "../models/theme.js";
import ThemeCategory from "../models/themeCategory.js";
import fs from "fs";
import path from "path";

const getDirSize = (dirPath) => {
    let size = 0;
    try {
        if (!fs.existsSync(dirPath)) return 0;
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const stats = fs.statSync(path.join(dirPath, file));
            if (stats.isFile()) size += stats.size;
        }
    } catch (e) {
        console.error("Error reading uploads folder size:", e);
    }
    return size;
};

// GET DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" });
        const totalPages = await Love.countDocuments({});
        const totalThemes = await Theme.countDocuments({});
        const totalCategories = await ThemeCategory.countDocuments({});

        // Calculate total views
        const viewsResult = await Love.aggregate([
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        const totalViews = viewsResult[0]?.totalViews || 0;

        // Most used themes
        const themeStats = await Love.aggregate([
            { $group: { _id: "$theme", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Pages created today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const pagesToday = await Love.countDocuments({
            createdAt: { $gte: todayStart }
        });

        // Disk usage of uploads/ folder
        const storageBytes = getDirSize("uploads");
        const storageUsage = `${(storageBytes / (1024 * 1024)).toFixed(2)} MB`;

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalPages,
                totalThemes,
                totalCategories,
                totalViews,
                themeStats,
                pagesToday,
                storageUsage,
                storageBytes
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL PAGES (ADMIN)
export const getAllPagesAdmin = async (req, res) => {
    try {
        const pages = await Love.find({})
            .populate("userId", "fullname username email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: pages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE PAGE STATUS (ADMIN - HIDE/ARCHIVE)
export const updatePageStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        const page = await Love.findById(id);
        if (!page) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        page.status = status;
        await page.save();

        res.status(200).json({
            success: true,
            message: `Page status updated to ${status}`,
            data: page
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE PAGE (ADMIN)
export const deletePageAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await Love.findById(id);
        if (!page) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        // Clean up files on disk safely
        if (page.content?.images) {
            page.content.images.forEach(img => {
                try {
                    const filename = img.substring(img.lastIndexOf("/") + 1);
                    const filePath = path.join("uploads", filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch (err) {
                    console.error("[Admin Cleanup] Error deleting file:", img, err);
                }
            });
        }

        if (page.content?.music) {
            try {
                const filename = page.content.music.substring(page.content.music.lastIndexOf("/") + 1);
                const filePath = path.join("uploads", filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.error("[Admin Cleanup] Error deleting music file:", page.content.music, err);
            }
        }

        await page.deleteOne();
        res.status(200).json({
            success: true,
            message: "Page deleted successfully by Admin"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
