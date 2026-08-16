import express from "express";
import upload from "../middleware/upload.js";
import {
    createLove,
    getAllLove,
    getLoveBySlug,
    updateLove,
    deleteLove,
    verifyPin,
    increaseViews,
} from "../controllers/loveController.js";

import {
    verifyToken
} from "../middleware/auth.js";

import { pinLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();


// PUBLIC

router.get("/page/:slug", getLoveBySlug);

router.post("/verify-pin", pinLimiter, verifyPin);

router.patch("/:slug/view", increaseViews);


// PRIVATE
router.get(
    "/",
    verifyToken,
    getAllLove
);

router.post(
    "/",
    verifyToken,
    upload.fields([
        { name: "images", maxCount: 50 },
        { name: "music", maxCount: 1 }
    ]),
    createLove
);

router.put(
    "/:id",
    verifyToken,
    upload.fields([
        { name: "images", maxCount: 50 },
        { name: "music", maxCount: 1 }
    ]),
    updateLove
);

router.delete("/:id", verifyToken, deleteLove);



export default router;