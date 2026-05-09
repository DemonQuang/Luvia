import User from "../models/user.js";
import bcrypt from "bcrypt";


// GET ALL
const getAllUsers = async () => {
    return await User.find();
};


// GET BY ID
const getUserById = async (id) => {
    return await User.findById(id);
};


// LOGIN BY USERNAME OR EMAIL
const getUserByUsernameOrEmail = async (
    usernameOrEmail
) => {

    return await User.findOne({

        $or: [

            {
                username: usernameOrEmail
            },

            {
                email: usernameOrEmail
            }
        ]

    }).select("+password");
};


// CHECK USERNAME EXISTS
const checkExistingUsername = async (
    username
) => {

    return await User.findOne({
        username
    });
};


// CHECK EMAIL EXISTS
const checkExistingEmail = async (
    email
) => {

    return await User.findOne({
        email
    });
};


// CREATE USER
const createUser = async (data) => {

    return await User.create(data);
};


// UPDATE USER
const updateUser = async (id, data) => {

    const user = await User.findById(id);

    if (!user) return null;

    // Update fields
    if (data.fullname) {
        user.fullname = data.fullname;
    }

    if (data.username) {
        user.username = data.username;
    }

    if (data.email) {
        user.email = data.email;
    }

    // Hash password mới
    if (data.password) {

        user.password = await bcrypt.hash(
            data.password,
            10
        );
    }

    await user.save();

    return user;
};


// DELETE USER
const deleteUser = async (id) => {

    return await User.findByIdAndDelete(id);
};


export {
    getAllUsers,
    getUserById,
    getUserByUsernameOrEmail,
    checkExistingUsername,
    checkExistingEmail,
    createUser,
    updateUser,
    deleteUser
};