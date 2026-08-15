import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        key: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        thumbnail: {
            type: String,
            default: ""
        },
        preview: {
            type: String,
            default: ""
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ThemeCategory",
            required: true
        },
        supportedRecipientTypes: {
            type: [String],
            default: []
        },
        supportedOccasions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Occasion"
        }],
        primaryColor: {
            type: String,
            default: "#ff5e9c"
        },
        secondaryColor: {
            type: String,
            default: "#f1c40f"
        },
        background: {
            type: String,
            default: "linear-gradient(to bottom, #ffeef8, #ffd3eb)"
        },
        font: {
            type: String,
            default: "Inter"
        },
        animation: {
            type: String,
            default: "none"
        },
        defaultMusic: {
            type: String,
            default: ""
        },
        layout: {
            type: String,
            default: "classic"
        },
        galleryLayout: {
            type: String,
            default: "cosmic"
        },
        letterLayout: {
            type: String,
            default: "flowers"
        },
        status: {
            type: String,
            enum: ["draft", "published", "disabled"],
            default: "draft"
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Theme", themeSchema);
