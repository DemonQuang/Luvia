import express from "express";

import {
    register,
    login,
    index,
    removeUser
} from "../controllers/userController.js";

import {
    verifyToken,
    isAdmin
} from "../middleware/auth.js";

const router = express.Router();

// AUTH
router.post("/register", register);
router.post("/login", login);

// ADMIN
router.get("/admin/users", verifyToken, isAdmin, index);

router.delete(
    "/admin/users/:id",
    verifyToken,
    isAdmin,
    removeUser
);

export default router;