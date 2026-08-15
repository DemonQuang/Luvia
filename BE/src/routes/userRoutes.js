import express from "express";

import {
    register,
    login,
    forgotPassword,
    index,
    removeUser
} from "../controllers/userController.js";

import {
    verifyToken,
    isAdmin
} from "../middleware/auth.js";

import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// AUTH
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/forgot-password", authLimiter, forgotPassword);

// ADMIN
router.get("/admin/users", verifyToken, isAdmin, index);

router.delete(
    "/admin/users/:id",
    verifyToken,
    isAdmin,
    removeUser
);

export default router;