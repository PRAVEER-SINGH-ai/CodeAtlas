const mongoose = require("mongoose");

const platforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

const platformAccountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    platform: {
        type: String,
        required: true,
        enum: platforms
    },
    handle: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    profileUrl: {
        type: String,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "failed"],
        default: "pending"
    },
    verificationCodeHash: {
        type: String,
        default: null,
        select: false
    },
    verificationExpiresAt: {
        type: Date,
        default: null
    },
    isPrimary: {
        type: Boolean,
        default: false
    },
    identity: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    currentStats: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    lastSyncedAt: {
        type: Date,
        default: null
    },
    syncStatus: {
        type: String,
        enum: ["never_synced", "success", "failed", "in_progress"],
        default: "never_synced"
    },
    syncError: {
        type: String,
        default: null,
        maxlength: 500
    }
}, {
    timestamps: true
});

// Keep the legacy boolean consistent with verificationStatus.
platformAccountSchema.pre("validate", function () {
    this.isVerified = this.verificationStatus === "verified";
});

platformAccountSchema.index(
    { user: 1, platform: 1, handle: 1 },
    { unique: true }
);

// Only one primary account per platform for each user.
platformAccountSchema.index(
    { user: 1, platform: 1 },
    {
        unique: true,
        partialFilterExpression: { isPrimary: true }
    }
);

module.exports = mongoose.model("PlatformAccount", platformAccountSchema);
