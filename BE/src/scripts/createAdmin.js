import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Luvia:Luvia@luvia.ovii8ij.mongodb.net/?appName=Luvia";

async function main() {
  const args = process.argv.slice(2);
  const action = args[0]; // 'create' or 'promote'

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    if (action === "promote") {
      const username = args[1];
      if (!username) {
        console.error("Vui lòng cung cấp username cần nâng quyền: npm run create-admin promote <username>");
        process.exit(1);
      }

      const user = await User.findOne({ username });
      if (!user) {
        console.error(`Không tìm thấy người dùng có username: ${username}`);
        process.exit(1);
      }

      user.role = "admin";
      await user.save();
      console.log(`\n🎉 THÀNH CÔNG: Đã nâng quyền người dùng "${user.fullname}" (@${user.username}) thành ADMIN!`);
    } else {
      // Default: Create new Admin
      const fullname = "Super Admin Luvia";
      const username = args[1] || "admin";
      const email = args[2] || "admin@luvia.com";
      const password = args[3] || "admin123";

      const existing = await User.findOne({ $or: [{ username }, { email }] });
      if (existing) {
        console.log(`\nTài khoản admin (@${username} hoặc email ${email}) đã tồn tại.`);
        console.log("Bạn có thể đăng nhập bằng tài khoản này, hoặc chạy lệnh sau để nâng quyền tài khoản khác:");
        console.log(`node src/scripts/createAdmin.js promote <username_khac>`);
        process.exit(0);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = await User.create({
        fullname,
        username,
        email,
        password: hashedPassword,
        role: "admin"
      });

      console.log("\n🎉 TẠO TÀI KHOẢN SUPER ADMIN THÀNH CÔNG!");
      console.log("-----------------------------------------");
      console.log(`- Họ và tên: ${newAdmin.fullname}`);
      console.log(`- Username:  ${newAdmin.username}`);
      console.log(`- Email:     ${newAdmin.email}`);
      console.log(`- Mật khẩu:  ${password}`);
      console.log("-----------------------------------------");
      console.log("Hãy sử dụng thông tin này để đăng nhập tại trang chủ Luvia!");
    }
  } catch (error) {
    console.error("Lỗi khi xử lý:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

main();
