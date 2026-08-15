import express from "express";
import {
    getAllThemes,
    getThemeDetails,
    getThemeByKey,
    getAdminThemes,
    createTheme,
    updateTheme,
    deleteTheme
} from "../controllers/themeController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllThemes);
router.get("/key/:key", getThemeByKey);
router.get("/:id", getThemeDetails);

// ADMIN ONLY
router.get("/admin/list", verifyToken, isAdmin, getAdminThemes);
router.post(
    "/admin",
    verifyToken,
    isAdmin,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "preview", maxCount: 1 }
    ]),
    createTheme
);
router.patch(
    "/admin/:id",
    verifyToken,
    isAdmin,
    upload.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "preview", maxCount: 1 }
    ]),
    updateTheme
);
router.delete("/admin/:id", verifyToken, isAdmin, deleteTheme);

export default router;
