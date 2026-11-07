const mongoose = require("mongoose");

const leetCodeGoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlatformAccount",
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 80
    },
    metric: {
        type: String,
        enum: ["problemsSolved", "easyProblemsSolved", "mediumProblemsSolved",
            "hardProblemsSolved", "rating", "contestsParticipated"],
        required: true
    },
    target: {
        type: Number,
        required: true,
        min: 1
    },
    dueDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

leetCodeGoalSchema.index({ user: 1, account: 1, createdAt: -1 });

module.exports = mongoose.model("LeetCodeGoal", leetCodeGoalSchema);