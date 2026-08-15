import express from "express";
import {
    getAllCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/themeCategoryController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllCategories);

// ADMIN ONLY
router.get("/admin", verifyToken, isAdmin, getAdminCategories);
router.post("/admin", verifyToken, isAdmin, createCategory);
router.patch("/admin/:id", verifyToken, isAdmin, updateCategory);
router.delete("/admin/:id", verifyToken, isAdmin, deleteCategory);

export default router;
