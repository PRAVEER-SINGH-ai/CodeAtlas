const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true,
        enum: ["codeforces", "leetcode", "codechef", "atcoder", "geeksforgeeks"]
    },
    contestId: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    url: {
        type: String,
        default: null
    },
    startTime: {
        type: Date,
        required: true
    },
    durationSeconds: {
        type: Number,
        min: 1,
        default: null
    },
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "finished"],
        required: true
    }
}, {
    timestamps: true
});

contestSchema.index(
    { platform: 1, contestId: 1 },
    { unique: true }
);

contestSchema.index({ platform: 1, status: 1, startTime: 1 });
contestSchema.index({ startTime: 1, status: 1 });

module.exports = mongoose.model("Contest", contestSchema);
