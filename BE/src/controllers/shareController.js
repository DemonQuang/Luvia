import Love from "../models/love.js";

// Helper function to escape HTML entities for XSS prevention
const escapeHtml = (unsafe) => {
    if (!unsafe) return "";
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

export const getSharePage = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await Love.findOne({ slug });

        const frontendUrl = process.env.FRONTEND_URL || 
            (process.env.BASE_URL && !process.env.BASE_URL.includes(':3000') ? process.env.BASE_URL : "http://localhost:5173");

        if (!page) {
            return res.status(404).send(`
                <html>
                    <head><title>Không tìm thấy trang</title></head>
                    <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                        <h2>Không tìm thấy trang kỷ niệm</h2>
                        <p>Đường liên kết không tồn tại hoặc đã bị xóa.</p>
                        <a href="${escapeHtml(frontendUrl)}">Về trang chủ Luvia</a>
                    </body>
                </html>
            `);
        }

        const title = escapeHtml(page.title || "Luvia — Lời yêu thương");
        const recipient = escapeHtml(page.content?.recipient || "bạn");
        const shareTitle = `💌 Một lời nhắn gửi đến ${recipient}`;
        const description = escapeHtml(page.content?.messages?.[0] || "Một trang kỷ niệm đầy ắp những khoảnh khắc đáng nhớ và những lời chúc chân thành.");
        const image = escapeHtml(page.content?.images?.[0] || `${process.env.BASE_URL}/uploads/default-og.png`);
        const redirectUrl = `${frontendUrl}/page/${slug}`;

        // Return HTML containing Open Graph tags and immediate client redirect
        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                
                <!-- Open Graph tags for Facebook, Zalo, Telegram, etc. -->
                <meta property="og:title" content="${shareTitle}" />
                <meta property="og:description" content="${description}" />
                <meta property="og:image" content="${image}" />
                <meta property="og:url" content="${escapeHtml(process.env.BASE_URL)}/api/share/${escapeHtml(slug)}" />
                <meta property="og:type" content="website" />
                
                <!-- Twitter Card tags -->
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="${shareTitle}">
                <meta name="twitter:description" content="${description}">
                <meta name="twitter:image" content="${image}">
                
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        background: #ffeef8;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        text-align: center;
                        color: #ff5e9c;
                    }
                    .loader {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #ff5e9c;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
                
                <!-- Redirect immediately for real browsers -->
                <script type="text/javascript">
                    window.location.href = "${redirectUrl.replace(/"/g, '\\"')}";
                </script>
            </head>
            <body>
                <div>
                    <div class="loader"></div>
                    <h2>Đang chuyển hướng đến trang kỷ niệm của ${recipient}...</h2>
                    <p>Nếu trang không tự động chuyển hướng, hãy <a href="${escapeHtml(redirectUrl)}">bấm vào đây</a>.</p>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
