import Theme from "../models/theme.js";
import Occasion from "../models/occasion.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Helper function to delete local files securely
const deleteLocalFile = (fileUrl) => {
    if (!fileUrl) return;
    try {
        if (fileUrl.includes("/uploads/")) {
            const filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            const filePath = path.join("uploads", filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (err) {
        console.error("[Theme Cleanup] Error deleting file:", fileUrl, err);
    }
};

// GET ALL (PUBLIC, ACTIVE/PUBLISHED ONLY)
export const getAllThemes = async (req, res) => {
    try {
        const { recipient, occasion } = req.query;
        let query = { status: "published" };

        if (recipient) {
            query.supportedRecipientTypes = recipient;
        }

        if (occasion) {
            // Find the occasion by its slug
            const occDoc = await Occasion.findOne({ slug: occasion.toLowerCase() });
            if (occDoc) {
                query.supportedOccasions = occDoc._id;
            } else {
                // If occasion slug doesn't exist, return empty array to prevent showing wrong themes
                return res.status(200).json({ success: true, data: [] });
            }
        }

        const themes = await Theme.find(query)
            .populate("category")
            .populate("supportedOccasions");

        res.status(200).json({
            success: true,
            data: themes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET DETAILS
export const getThemeDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const theme = await Theme.findById(id)
            .populate("category")
            .populate("supportedOccasions");

        if (!theme) {
            return res.status(404).json({ success: false, message: "Theme not found" });
        }

        res.status(200).json({
            success: true,
            data: theme
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BY KEY (FOR DYNAMIC RENDERING)
export const getThemeByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const theme = await Theme.findOne({ key: key.toLowerCase() })
            .populate("category")
            .populate("supportedOccasions");

        if (!theme) {
            return res.status(404).json({ success: false, message: "Theme not found" });
        }

        res.status(200).json({
            success: true,
            data: theme
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL FOR ADMIN
export const getAdminThemes = async (req, res) => {
    try {
        const themes = await Theme.find({})
            .populate("category")
            .populate("supportedOccasions");

        res.status(200).json({
            success: true,
            data: themes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE (ADMIN)
export const createTheme = async (req, res) => {
    try {
        const {
            name,
            key,
            description,
            category,
            supportedRecipientTypes,
            supportedOccasions,
            primaryColor,
            secondaryColor,
            background,
            font,
            animation,
            defaultMusic,
            layout,
            galleryLayout,
            letterLayout,
            status
        } = req.body;

        if (!name || !key || !category) {
            return res.status(400).json({ success: false, message: "Name, Key and Category are required" });
        }

        const existing = await Theme.findOne({ key: key.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: "Theme key already exists" });
        }

        // Process file uploads
        const thumbnail = req.files?.thumbnail?.[0]
            ? `${process.env.BASE_URL}/uploads/${req.files.thumbnail[0].filename}`
            : "";

        const preview = req.files?.preview?.[0]
            ? `${process.env.BASE_URL}/uploads/${req.files.preview[0].filename}`
            : "";

        // Parse JSON strings from body (multer submits array fields as strings)
        let parsedRecipients = [];
        let parsedOccasions = [];
        try {
            if (supportedRecipientTypes) {
                parsedRecipients = typeof supportedRecipientTypes === 'string'
                    ? JSON.parse(supportedRecipientTypes)
                    : supportedRecipientTypes;
            }
            if (supportedOccasions) {
                parsedOccasions = typeof supportedOccasions === 'string'
                    ? JSON.parse(supportedOccasions)
                    : supportedOccasions;
            }
        } catch (e) {
            // Fallback to splitting if it was comma separated
            if (typeof supportedRecipientTypes === 'string') parsedRecipients = supportedRecipientTypes.split(",").map(s => s.trim());
            if (typeof supportedOccasions === 'string') parsedOccasions = supportedOccasions.split(",").map(s => s.trim());
        }

        const theme = await Theme.create({
            name,
            key: key.toLowerCase(),
            description: description || "",
            thumbnail,
            preview,
            category,
            supportedRecipientTypes: parsedRecipients,
            supportedOccasions: parsedOccasions,
            primaryColor: primaryColor || "#ff5e9c",
            secondaryColor: secondaryColor || "#f1c40f",
            background: background || "linear-gradient(to bottom, #ffeef8, #ffd3eb)",
            font: font || "Inter",
            animation: animation || "none",
            defaultMusic: defaultMusic || "",
            layout: layout || "classic",
            galleryLayout: galleryLayout || "cosmic",
            letterLayout: letterLayout || "flowers",
            status: status || "draft"
        });

        res.status(201).json({
            success: true,
            message: "Theme created successfully",
            data: theme
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE (ADMIN)
export const updateTheme = async (req, res) => {
    try {
        const { id } = req.params;
        const theme = await Theme.findById(id);
        if (!theme) {
            return res.status(404).json({ success: false, message: "Theme not found" });
        }

        const {
            name,
            key,
            description,
            category,
            supportedRecipientTypes,
            supportedOccasions,
            primaryColor,
            secondaryColor,
            background,
            font,
            animation,
            defaultMusic,
            layout,
            galleryLayout,
            letterLayout,
            status
        } = req.body;

        if (key && key.toLowerCase() !== theme.key) {
            const existing = await Theme.findOne({ key: key.toLowerCase() });
            if (existing) {
                return res.status(409).json({ success: false, message: "Theme key already exists" });
            }
            theme.key = key.toLowerCase();
        }

        // Process files
        if (req.files?.thumbnail?.[0]) {
            deleteLocalFile(theme.thumbnail);
            theme.thumbnail = `${process.env.BASE_URL}/uploads/${req.files.thumbnail[0].filename}`;
        }
        if (req.files?.preview?.[0]) {
            deleteLocalFile(theme.preview);
            theme.preview = `${process.env.BASE_URL}/uploads/${req.files.preview[0].filename}`;
        }

        // Parse JSON strings
        let parsedRecipients;
        let parsedOccasions;
        try {
            if (supportedRecipientTypes) {
                parsedRecipients = typeof supportedRecipientTypes === 'string'
                    ? JSON.parse(supportedRecipientTypes)
                    : supportedRecipientTypes;
            }
            if (supportedOccasions) {
                parsedOccasions = typeof supportedOccasions === 'string'
                    ? JSON.parse(supportedOccasions)
                    : supportedOccasions;
            }
        } catch (e) {
            if (typeof supportedRecipientTypes === 'string') parsedRecipients = supportedRecipientTypes.split(",").map(s => s.trim());
            if (typeof supportedOccasions === 'string') parsedOccasions = supportedOccasions.split(",").map(s => s.trim());
        }

        theme.name = name || theme.name;
        theme.description = description !== undefined ? description : theme.description;
        theme.category = category || theme.category;
        theme.supportedRecipientTypes = parsedRecipients !== undefined ? parsedRecipients : theme.supportedRecipientTypes;
        theme.supportedOccasions = parsedOccasions !== undefined ? parsedOccasions : theme.supportedOccasions;
        theme.primaryColor = primaryColor || theme.primaryColor;
        theme.secondaryColor = secondaryColor || theme.secondaryColor;
        theme.background = background || theme.background;
        theme.font = font || theme.font;
        theme.animation = animation || theme.animation;
        theme.defaultMusic = defaultMusic !== undefined ? defaultMusic : theme.defaultMusic;
        theme.layout = layout || theme.layout;
        theme.galleryLayout = galleryLayout || theme.galleryLayout;
        theme.letterLayout = letterLayout || theme.letterLayout;
        theme.status = status || theme.status;

        await theme.save();

        res.status(200).json({
            success: true,
            message: "Theme updated successfully",
            data: theme
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE (ADMIN)
export const deleteTheme = async (req, res) => {
    try {
        const { id } = req.params;
        const theme = await Theme.findById(id);
        if (!theme) {
            return res.status(404).json({ success: false, message: "Theme not found" });
        }

        // Clean up files on disk
        deleteLocalFile(theme.thumbnail);
        deleteLocalFile(theme.preview);

        await theme.deleteOne();
        res.status(200).json({
            success: true,
            message: "Theme deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
