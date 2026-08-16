import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Love from '../models/love.js';
import Music from '../models/music.js';
import Theme from '../models/theme.js';

dotenv.config();

const cleanUrl = (url) => {
    if (!url) return url;
    // Tìm vị trí của "/uploads/" trong chuỗi
    const uploadsIdx = url.indexOf('/uploads/');
    if (uploadsIdx !== -1) {
        // Cắt chuỗi bắt đầu từ "/uploads/"
        return url.substring(uploadsIdx);
    }
    return url;
};

const run = async () => {
    try {
        await connectDB();
        console.log('--- BẮT ĐẦU DỌN DẸP DATABASE ---');

        // 1. Dọn dẹp bảng Love
        const loves = await Love.find({});
        console.log(`Tìm thấy ${loves.length} trang kỷ niệm (Love)...`);
        let loveUpdated = 0;
        for (const love of loves) {
            let changed = false;

            if (love.content) {
                // Dọn dẹp mảng images
                if (Array.isArray(love.content.images)) {
                    const newImages = love.content.images.map(img => {
                        const cleaned = cleanUrl(img);
                        if (cleaned !== img) changed = true;
                        return cleaned;
                    });
                    love.content.images = newImages;
                }

                // Dọn dẹp mainImage
                if (love.content.mainImage) {
                    const cleaned = cleanUrl(love.content.mainImage);
                    if (cleaned !== love.content.mainImage) {
                        love.content.mainImage = cleaned;
                        changed = true;
                    }
                }

                // Dọn dẹp music
                if (love.content.music) {
                    const cleaned = cleanUrl(love.content.music);
                    if (cleaned !== love.content.music) {
                        love.content.music = cleaned;
                        changed = true;
                    }
                }
            }

            if (changed) {
                // Đánh dấu thuộc tính content đã thay đổi để mongoose lưu lại chính xác
                love.markModified('content');
                await love.save();
                loveUpdated++;
            }
        }
        console.log(`Đã dọn dẹp và cập nhật ${loveUpdated}/${loves.length} trang kỷ niệm.`);

        // 2. Dọn dẹp bảng Music
        const musics = await Music.find({});
        console.log(`Tìm thấy ${musics.length} bài hát (Music)...`);
        let musicUpdated = 0;
        for (const music of musics) {
            let changed = false;
            
            if (music.file) {
                const cleaned = cleanUrl(music.file);
                if (cleaned !== music.file) {
                    music.file = cleaned;
                    changed = true;
                }
            }

            if (music.thumbnail) {
                const cleaned = cleanUrl(music.thumbnail);
                if (cleaned !== music.thumbnail) {
                    music.thumbnail = cleaned;
                    changed = true;
                }
            }

            if (changed) {
                await music.save();
                musicUpdated++;
            }
        }
        console.log(`Đã dọn dẹp và cập nhật ${musicUpdated}/${musics.length} bài hát.`);

        // 3. Dọn dẹp bảng Theme
        const themes = await Theme.find({});
        console.log(`Tìm thấy ${themes.length} giao diện (Theme)...`);
        let themeUpdated = 0;
        for (const theme of themes) {
            let changed = false;

            if (theme.thumbnail) {
                const cleaned = cleanUrl(theme.thumbnail);
                if (cleaned !== theme.thumbnail) {
                    theme.thumbnail = cleaned;
                    changed = true;
                }
            }

            if (theme.preview) {
                const cleaned = cleanUrl(theme.preview);
                if (cleaned !== theme.preview) {
                    theme.preview = cleaned;
                    changed = true;
                }
            }

            if (changed) {
                await theme.save();
                themeUpdated++;
            }
        }
        console.log(`Đã dọn dẹp và cập nhật ${themeUpdated}/${themes.length} giao diện.`);

        console.log('--- HOÀN THÀNH DỌN DẸP DATABASE ---');
        process.exit(0);
    } catch (error) {
        console.error('Lỗi khi chạy script dọn dẹp:', error);
        process.exit(1);
    }
};

run();
