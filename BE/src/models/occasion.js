import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        icon: {
            type: String,
            default: ""
        },
        description: {
            type: String,
            default: ""
        },
        displayOrder: {
            type: Number,
            default: 0
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

export default mongoose.model("Occasion", occasionSchema);
