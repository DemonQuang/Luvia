import express from "express";
import {
    getDashboardStats,
    getAllPagesAdmin,
    updatePageStatusAdmin,
    deletePageAdmin
} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard-stats", verifyToken, isAdmin, getDashboardStats);
router.get("/pages", verifyToken, isAdmin, getAllPagesAdmin);
router.patch("/pages/:id/status", verifyToken, isAdmin, updatePageStatusAdmin);
router.delete("/pages/:id", verifyToken, isAdmin, deletePageAdmin);

export default router;
