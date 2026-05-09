import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import {
    getAllUsers,
    getUserById,
    getUserByUsernameOrEmail,
    checkExistingUsername,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService.js";


// REGISTER
export const register = async (req, res) => {

    try {
        const {
            fullname,
            username,
            email,
            password, role
        } = req.body;

        // Validate
        if (!fullname || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields"
            });
        }

        // Check username
        const existingUsername =
            await checkExistingUsername(username);

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Check email
        const existingEmail =
            await getUserByUsernameOrEmail(email);

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Create user
        const user = await createUser({
            fullname,
            username,
            email,
            password: hashedPassword,
            role: role || "user"
        });

        // Response
        res.status(201).json({
            success: true,
            message: "Register success",
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// LOGIN
export const login = async (req, res) => {

    try {

        // Đổi tên biến
        const {
            usernameOrEmail,
            password
        } = req.body;

        // Validate
        if (!usernameOrEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Username/email and password required"
            });
        }

        // Find user bằng username HOẶC email
        const user =
            await getUserByUsernameOrEmail(
                usernameOrEmail
            );

        // Không tìm thấy
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        // Sai password
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Create token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Response
        res.status(200).json({
            success: true,
            message: "Login success",
            token,

            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL USERS (ADMIN)
export const index = async (req, res) => {

    try {

        const users = await getAllUsers();

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE USER
export const removeUser = async (req, res) => {

    try {

        const deleted = await deleteUser(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Delete success"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};