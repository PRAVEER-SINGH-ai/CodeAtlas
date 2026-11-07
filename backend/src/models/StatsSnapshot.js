const mongoose = require("mongoose");

const statsSnapshotSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        default: null
    },
    maxRating: {
        type: Number,
        default: null
    },
    globalRank: {
        type: Number,
        min: 1,
        default: null
    },
    countryRank: {
        type: Number,
        min: 1,
        default: null
    },
    problemsSolved: {
        type: Number,
        min: 0,
        default: 0
    },
    contestsParticipated: {
        type: Number,
        min: 0,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        min: 0,
        default: 0
    },
    acceptedSubmissions: {
        type: Number,
        min: 0,
        default: 0
    },
    accuracy: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    capturedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Supports account history and latest-snapshot analytics queries.
statsSnapshotSchema.index({
    account: 1,
    user: 1,
    capturedAt: -1
});

module.exports = mongoose.model("StatsSnapshot", statsSnapshotSchema);
