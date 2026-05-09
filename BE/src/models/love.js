import mongoose from "mongoose";

const loveSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        pinHash: {
            type: String,
            required: true,
            select: false
        },

        theme: {
            type: String,
            enum: ["cute", "romantic", "dark"],
            default: "cute"
        },

        content: {
            messages: {
                type: [String],
                default: []
            },


            images: {
                type: [String],
                default: []
            },

            music: {
                type: String,
                default: ""
            }
        },

        views: {
            type: Number,
            default: 0
        },

        isPublic: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Love", loveSchema);