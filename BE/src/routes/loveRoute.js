import express from "express";

import {
    createLove,
    getAllLove,
    getLoveBySlug,
    updateLove,
    deleteLove,
    verifyPin,
    increaseViews
} from "../controllers/loveController.js";

import {
    verifyToken
} from "../middleware/auth.js";

const router = express.Router();


// PUBLIC

router.get("/page/:slug", getLoveBySlug);

router.post("/verify-pin", verifyPin);

router.patch("/:slug/view", increaseViews);


// PRIVATE
router.get(
    "/",
    verifyToken,
    getAllLove
);

router.post("/", verifyToken, createLove);

router.put("/:id", verifyToken, updateLove);

router.delete("/:id", verifyToken, deleteLove);


export default router;