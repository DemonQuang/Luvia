import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import ThemeCategory from "../models/themeCategory.js";
import Occasion from "../models/occasion.js";
import Theme from "../models/theme.js";
import Love from "../models/love.js";
import User from "../models/user.js";

// Setup dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Luvia:Luvia@luvia.ovii8ij.mongodb.net/?appName=Luvia";

async function run() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected.");

        // 1. Seed Theme Categories
        console.log("Seeding Theme Categories...");
        const categoriesData = [
            { name: "ROMANTIC", slug: "romantic", icon: "favorite", displayOrder: 1 },
            { name: "FAMILY", slug: "family", icon: "family_restroom", displayOrder: 2 },
            { name: "CUTE", slug: "cute", icon: "child_care", displayOrder: 3 },
            { name: "CELEBRATION", slug: "celebration", icon: "celebration", displayOrder: 4 },
            { name: "MINIMAL", slug: "minimal", icon: "filter_hdr", displayOrder: 5 }
        ];

        const categories = [];
        for (const cat of categoriesData) {
            let existing = await ThemeCategory.findOne({ slug: cat.slug });
            if (!existing) {
                existing = await ThemeCategory.create(cat);
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category exists: ${cat.name}`);
            }
            categories.push(existing);
        }

        const catMap = categories.reduce((map, cat) => {
            map[cat.slug] = cat._id;
            return map;
        }, {});

        // 2. Seed Occasions
        console.log("Seeding Occasions...");
        const occasionsData = [
            { name: "Kỷ niệm", slug: "anniversary", icon: "favorite", description: "Ngày kỷ niệm yêu nhau, kỷ niệm ngày cưới" },
            { name: "Sinh nhật", slug: "birthday", icon: "cake", description: "Chúc mừng sinh nhật ý nghĩa" },
            { name: "Valentine", slug: "valentine", icon: "volunteer_activism", description: "Ngày lễ tình nhân lãng mạn" },
            { name: "Tốt nghiệp", slug: "graduation", icon: "school", description: "Mốc son tốt nghiệp học tập" },
            { name: "Cảm ơn", slug: "thank_you", icon: "handshake", description: "Gửi lời cảm ơn chân thành" },
            { name: "Ngày cưới", slug: "wedding", icon: "church", description: "Chúc mừng ngày trăm năm hạnh phúc" },
            { name: "Kỷ niệm gia đình", slug: "family_memory", icon: "home", description: "Lưu giữ khoảnh khắc gia đình ấm áp" },
            { name: "Tưởng nhớ", slug: "memorial", icon: "sentiment_very_dissatisfied", description: "Kỷ niệm tưởng nhớ người đã khuất" },
            { name: "Chỉ vì...", slug: "just_because", icon: "redeem", description: "Gửi tặng bất cứ lúc nào, không cần dịp cụ thể" },
            { name: "Khác", slug: "other", icon: "more_horiz", description: "Các dịp kỷ niệm khác" }
        ];

        const occasions = [];
        for (const occ of occasionsData) {
            let existing = await Occasion.findOne({ slug: occ.slug });
            if (!existing) {
                existing = await Occasion.create(occ);
                console.log(`Created occasion: ${occ.name}`);
            } else {
                console.log(`Occasion exists: ${occ.name}`);
            }
            occasions.push(existing);
        }

        const occMap = occasions.reduce((map, occ) => {
            map[occ.slug] = occ._id;
            return map;
        }, {});

        // All recipients
        const allRecipients = ["LOVER", "MOTHER", "FATHER", "SPOUSE", "FAMILY", "GRANDPARENT", "FRIEND", "CHILD", "TEACHER", "OTHER"];
        const allOccasionIds = occasions.map(o => o._id);

        // 3. Seed Default Themes
        console.log("Seeding Default Themes...");
        const themesData = [
            {
                name: "Cute Pink",
                key: "cute",
                description: "Dễ thương, ấm áp với tông hồng phấn dịu dàng.",
                category: catMap["cute"],
                supportedRecipientTypes: allRecipients,
                supportedOccasions: allOccasionIds,
                primaryColor: "#ff5e9c",
                secondaryColor: "#f1c40f",
                background: "linear-gradient(to bottom, #ffeef8, #ffd3eb)",
                font: "Inter",
                animation: "none",
                layout: "classic",
                galleryLayout: "polaroid",
                letterLayout: "cozy",
                status: "published"
            },
            {
                name: "Romantic Hearts",
                key: "romantic",
                description: "Lãng mạn đậm đà, tích hợp hiệu ứng bay tim 3D.",
                category: catMap["romantic"],
                supportedRecipientTypes: ["LOVER", "SPOUSE", "OTHER"],
                supportedOccasions: [occMap["anniversary"], occMap["valentine"], occMap["wedding"], occMap["just_because"], occMap["other"]],
                primaryColor: "#e74c3c",
                secondaryColor: "#f1c40f",
                background: "linear-gradient(to bottom, #ffe3e3, #ffb3b3)",
                font: "Inter",
                animation: "heart",
                layout: "classic",
                galleryLayout: "cosmic",
                letterLayout: "flowers",
                status: "published"
            },
            {
                name: "Dark Romance",
                key: "dark",
                description: "Huyền ảo, bí ẩn với giao diện tối tối giản sang trọng.",
                category: catMap["minimal"],
                supportedRecipientTypes: allRecipients,
                supportedOccasions: allOccasionIds,
                primaryColor: "#a29bfe",
                secondaryColor: "#ffeaa7",
                background: "#1a1a2e",
                font: "Inter",
                animation: "none",
                layout: "classic",
                galleryLayout: "polaroid",
                letterLayout: "cozy",
                status: "published"
            }
        ];

        for (const t of themesData) {
            let existing = await Theme.findOne({ key: t.key });
            if (!existing) {
                await Theme.create(t);
                console.log(`Created theme: ${t.name}`);
            } else {
                // Update theme definition to ensure it matches supported recipients/occasions
                existing.category = t.category;
                existing.supportedRecipientTypes = t.supportedRecipientTypes;
                existing.supportedOccasions = t.supportedOccasions;
                existing.galleryLayout = t.galleryLayout;
                existing.letterLayout = t.letterLayout;
                await existing.save();
                console.log(`Updated theme settings: ${t.name}`);
            }
        }

        // 4. Migrate Legacy Pages
        console.log("Migrating legacy Pages...");
        const pages = await Love.find({});
        console.log(`Found ${pages.length} pages in database.`);

        const defaultUser = await User.findOne({});
        if (!defaultUser) {
            console.warn("WARNING: No user found in database! Pages without a userId might fail validation.");
        }

        let migratedCount = 0;
        for (const page of pages) {
            let updated = false;

            if (!page.userId && defaultUser) {
                page.userId = defaultUser._id;
                console.log(`Assigned default userId ${defaultUser._id} to page ${page.slug}`);
                updated = true;
            }

            if (!page.recipientType || page.recipientType === "OTHER") {
                // Determine recipientType based on title/recipient
                const recLower = (page.content?.recipient || "").toLowerCase();
                const titleLower = (page.title || "").toLowerCase();

                if (recLower.includes("mẹ") || recLower.includes("me")) page.recipientType = "MOTHER";
                else if (recLower.includes("bố") || recLower.includes("ba") || recLower.includes("bo")) page.recipientType = "FATHER";
                else if (recLower.includes("bạn") || recLower.includes("ban") || recLower.includes("friend")) page.recipientType = "FRIEND";
                else if (recLower.includes("gia đình") || recLower.includes("gia dinh")) page.recipientType = "FAMILY";
                else if (recLower.includes("vợ") || recLower.includes("vo") || recLower.includes("chồng") || recLower.includes("chong")) page.recipientType = "SPOUSE";
                else page.recipientType = "LOVER"; // Default legacy was for lovers

                updated = true;
            }

            if (!page.occasion || page.occasion === "OTHER") {
                // Map occasion based on content.occasion text
                const occText = (page.content?.occasion || "").toLowerCase();
                if (occText.includes("sinh nhật") || occText.includes("sinh nhat") || occText.includes("birthday")) {
                    page.occasion = "birthday";
                } else if (occText.includes("ngày cưới") || occText.includes("ngay cuoi") || occText.includes("wedding")) {
                    page.occasion = "wedding";
                } else if (occText.includes("valentine")) {
                    page.occasion = "valentine";
                } else if (occText.includes("tốt nghiệp") || occText.includes("tot nghiep")) {
                    page.occasion = "graduation";
                } else if (occText.includes("cảm ơn") || occText.includes("cam on")) {
                    page.occasion = "thank_you";
                } else {
                    page.occasion = "anniversary";
                }
                updated = true;
            }

            if (!page.status) {
                page.status = "PUBLISHED";
                updated = true;
            }

            if (updated) {
                await page.save();
                migratedCount++;
            }
        }
        console.log(`Migration complete. Migrated ${migratedCount} legacy pages.`);

    } catch (err) {
        console.error("Error during seed/migration:", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

run();
