import express from "express";
import {
    getAllOccasions,
    getAdminOccasions,
    createOccasion,
    updateOccasion,
    deleteOccasion
} from "../controllers/occasionController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllOccasions);

// ADMIN ONLY
router.get("/admin", verifyToken, isAdmin, getAdminOccasions);
router.post("/admin", verifyToken, isAdmin, createOccasion);
router.patch("/admin/:id", verifyToken, isAdmin, updateOccasion);
router.delete("/admin/:id", verifyToken, isAdmin, deleteOccasion);

export default router;
