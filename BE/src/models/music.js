import mongoose from "mongoose";

const musicSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        artist: {
            type: String,
            default: "Unknown"
        },
        duration: {
            type: Number,
            default: 0
        },
        file: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            default: ""
        },
        category: {
            type: String,
            default: "general"
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Music", musicSchema);
