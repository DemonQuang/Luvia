import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import path from "path";
import loveRoutes from "./routes/loveRoute.js";
import authRoutes from "./routes/userRoutes.js";
import themeCategoryRoutes from "./routes/themeCategoryRoutes.js";
import occasionRoutes from "./routes/occasionRoutes.js";
import themeRoutes from "./routes/themeRoutes.js";
import musicRoutes from "./routes/musicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import shareRoutes from "./routes/shareRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(
    "/uploads",
    express.static("uploads")
);
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/loves", loveRoutes);
app.use("/api/theme-categories", themeCategoryRoutes);
app.use("/api/occasions", occasionRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/musics", musicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/share", shareRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
    });
});

// Port
const PORT = process.env.PORT || 3000;

// Connect DB + Start Server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    });