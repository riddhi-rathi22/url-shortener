const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const urlSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        originalUrl: {
            type: String,
            required: true,
            validate: {
                validator: function (value) {
                    return /^(https?:\/\/)/.test(value);
                },
                message: "URL must start with http:// or https://",
            },
        },

        shortId: {
            type: String,
            required: true,
            default: () => nanoid(8),
            unique: true,
        },

        customAlias: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            match: /^[a-z0-9-]+$/,
        },

        clicks: {
            type: Number,
            default: 0,
        },

        lastVisited: {
            type: Date,
        },

        clickHistory: [
    {
        clickedAt: {
            type: Date,
            default: Date.now,
        },
        browser: {
            type: String,
        },
        os: {
            type: String,
        },
        device: {
            type: String,
        },
    },
],
        visitorStats: {
    browser: {
        type: String,
    },
    os: {
        type: String,
    },
    device: {
        type: String,
    },
},

        expiresAt: {
            type: Date,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

    },
    {
        timestamps: true,
    }
);

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;