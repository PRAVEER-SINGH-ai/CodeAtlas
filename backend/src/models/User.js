const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: 3,
        maxlength: 25,
        match: /^[a-z0-9_]{3,25}$/
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 254,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationTokenHash: {
        type: String,
        default: null,
        select: false
    },
    emailVerificationExpiresAt: {
        type: Date,
        default: null,
        select: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);
