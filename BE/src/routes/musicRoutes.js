import express from "express";
import {
    getAllMusic,
    getAdminMusic,
    createMusic,
    updateMusic,
    deleteMusic,
    searchFreeMusic
} from "../controllers/musicController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllMusic);

// ADMIN ONLY
router.get("/admin", verifyToken, isAdmin, getAdminMusic);
router.get("/admin/search-free", verifyToken, isAdmin, searchFreeMusic);
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    createMusic
);
router.patch(
    "/admin/:id",
    verifyToken,
    isAdmin,
    upload.fields([
        { name: "file", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    updateMusic
);
router.delete("/admin/:id", verifyToken, isAdmin, deleteMusic);

export default router;