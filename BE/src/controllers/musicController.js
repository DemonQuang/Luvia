import Music from "../models/music.js";
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
        console.error("[Music Cleanup] Error deleting file:", fileUrl, err);
    }
};

// GET ALL (PUBLIC, ACTIVE ONLY)
export const getAllMusic = async (req, res) => {
    try {
        const musicList = await Music.find({ status: "active" }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: musicList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL FOR ADMIN
export const getAdminMusic = async (req, res) => {
    try {
        const musicList = await Music.find({}).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: musicList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// CREATE (ADMIN)
export const createMusic = async (req, res) => {
    try {
        const { name, artist, duration, category, status } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Music name is required" });
        }

        let fileUrl = req.files?.file?.[0]
            ? `${process.env.BASE_URL}/uploads/${req.files.file[0].filename}`
            : "";

        if (!fileUrl && req.body.fileUrl) {
            fileUrl = req.body.fileUrl;
        }

        if (!fileUrl) {
            return res.status(400).json({ success: false, message: "Music audio file is required" });
        }

        let thumbnailUrl = req.files?.thumbnail?.[0]
            ? `${process.env.BASE_URL}/uploads/${req.files.thumbnail[0].filename}`
            : "";

        if (!thumbnailUrl && req.body.thumbnailUrl) {
            thumbnailUrl = req.body.thumbnailUrl;
        }

        const music = await Music.create({
            name,
            artist: artist || "Unknown",
            duration: Number(duration) || 0,
            file: fileUrl,
            thumbnail: thumbnailUrl,
            category: category || "general",
            status: status || "active"
        });

        res.status(201).json({
            success: true,
            message: "Music track added successfully",
            data: music
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE (ADMIN)
export const updateMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ success: false, message: "Music track not found" });
        }

        const { name, artist, duration, category, status } = req.body;

        if (req.files?.file?.[0]) {
            deleteLocalFile(music.file);
            music.file = `${process.env.BASE_URL}/uploads/${req.files.file[0].filename}`;
        } else if (req.body.fileUrl !== undefined && req.body.fileUrl !== music.file) {
            deleteLocalFile(music.file);
            music.file = req.body.fileUrl;
        }

        if (req.files?.thumbnail?.[0]) {
            deleteLocalFile(music.thumbnail);
            music.thumbnail = `${process.env.BASE_URL}/uploads/${req.files.thumbnail[0].filename}`;
        } else if (req.body.thumbnailUrl !== undefined && req.body.thumbnailUrl !== music.thumbnail) {
            deleteLocalFile(music.thumbnail);
            music.thumbnail = req.body.thumbnailUrl;
        }

        music.name = name || music.name;
        music.artist = artist !== undefined ? artist : music.artist;
        music.duration = duration !== undefined ? Number(duration) : music.duration;
        music.category = category !== undefined ? category : music.category;
        music.status = status || music.status;

        await music.save();

        res.status(200).json({
            success: true,
            message: "Music track updated successfully",
            data: music
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE (ADMIN)
export const deleteMusic = async (req, res) => {
    try {
        const { id } = req.params;
        const music = await Music.findById(id);
        if (!music) {
            return res.status(404).json({ success: false, message: "Music track not found" });
        }

        // Clean up files on disk
        deleteLocalFile(music.file);
        deleteLocalFile(music.thumbnail);

        await music.deleteOne();
        res.status(200).json({
            success: true,
            message: "Music track deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// SEARCH FREE MUSIC (HEARTHIS.AT)
export const searchFreeMusic = async (req, res) => {
    try {
        const { q, count } = req.query;
        const searchQuery = q || "";
        const limit = Number(count) || 15;

        let url = `https://api-v2.hearthis.at/feed/?type=popular&count=${limit}`;
        if (searchQuery.trim() !== "") {
            url = `https://api-v2.hearthis.at/search/?q=${encodeURIComponent(searchQuery)}&t=tracks&count=${limit}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch from hearthis.at API: ${response.statusText}`);
        }

        const data = await response.json();

        // Hearthis.at API search returns an array of tracks or an object if error
        const tracks = Array.isArray(data) ? data : [];

        const formattedTracks = tracks.map(track => ({
            id: track.id,
            name: track.title,
            artist: track.user?.username || "Unknown",
            duration: Number(track.duration) || 0,
            fileUrl: track.preview_url || track.stream_url || "",
            thumbnailUrl: track.artwork_url || track.thumb || ""
        }));

        res.status(200).json({
            success: true,
            data: formattedTracks
        });
    } catch (error) {
        console.error("[SearchFreeMusic] Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

