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
            default: "cute"
        },

        recipientType: {
            type: String,
            enum: ["LOVER", "MOTHER", "FATHER", "SPOUSE", "FAMILY", "GRANDPARENT", "FRIEND", "CHILD", "TEACHER", "OTHER"],
            default: "OTHER"
        },

        occasion: {
            type: String,
            default: "OTHER"
        },

        status: {
            type: String,
            enum: ["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"],
            default: "PUBLISHED"
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

            mainImage: {
                type: String,
                default: ""
            },

            layout: {
                type: String,
                default: ""
            },

            background: {
                type: String,
                default: ""
            },

            primaryColor: {
                type: String,
                default: ""
            },

            secondaryColor: {
                type: String,
                default: ""
            },

            music: {
                type: String,
                default: ""
            },

            recipient: {
                type: String,
                default: ""
            },

            occasion: {
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