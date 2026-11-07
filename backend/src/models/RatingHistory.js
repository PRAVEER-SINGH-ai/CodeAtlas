const mongoose = require("mongoose");

const platforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

const ratingHistorySchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlatformAccount",
        required: true
    },
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
    contestId: {
        type: String,
        required: true,
        trim: true
    },
    contestName: {
        type: String,
        trim: true,
        default: ""
    },
    rank: {
        type: Number,
        min: 1,
        default: null
    },
    oldRating: {
        type: Number,
        default: null
    },
    newRating: {
        type: Number,
        default: null
    },
    date: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

ratingHistorySchema.index(
    { account: 1, contestId: 1 },
    { unique: true }
);

ratingHistorySchema.index({ account: 1, date: -1 });
ratingHistorySchema.index({ user: 1, platform: 1, date: -1 });

module.exports = mongoose.model("RatingHistory", ratingHistorySchema);
