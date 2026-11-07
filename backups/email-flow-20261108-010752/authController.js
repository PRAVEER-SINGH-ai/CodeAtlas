const mongoose = require("mongoose");
const crypto = require("crypto");

const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");
const { generateAccessToken } = require("../utils/token");

const {
    isEmailConfigured,
    sendVerificationEmail
} = require("../services/emailService");

function databaseReady(res) {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            message: "Database is not connected yet. Please try again later."
        });
        return false;
    }

    return true;
}

function validEmail(email) {
    return typeof email === "string" &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createVerificationToken() {
    const token = crypto.randomBytes(32).toString("hex");

    return {
        token,
        hash: crypto.createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    };
}

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

exports.register = async (req, res, next) => {
    try {
        const { name, username, email, password } = req.body;

        if (
            typeof name !== "string" ||
            typeof username !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() || !username.trim() || !email.trim() || !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (name.trim().length < 2 || name.trim().length > 50) {
            return res.status(400).json({
                success: false,
                message: "Name must contain 2 to 50 characters"
            });
        }

        if (!/^[a-zA-Z0-9_]{3,25}$/.test(username.trim())) {
            return res.status(400).json({
                success: false,
                message: "Username must be 3-25 characters and contain only letters, numbers or underscores"
            });
        }

        if (!validEmail(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address"
            });
        }

        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({
                success: false,
                message: "Password must contain 8 to 128 characters"
            });
        }

        if (!databaseReady(res)) return;

        if (!isEmailConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Email service is not configured yet. Please try again later."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or username is already registered"
            });
        }

        const hashedPassword = await hashPassword(password);
        const verification = createVerificationToken();

        const user = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            isEmailVerified: false,
            emailVerificationTokenHash: verification.hash,
            emailVerificationExpiresAt: verification.expiresAt
        });

        try {
            await sendVerificationEmail(
                user.email,
                user.name,
                verification.token
            );
        } catch (emailError) {
            console.error("Verification email delivery failed:", emailError.message);

            return res.status(503).json({
                success: false,
                message: "Your account was created, but the verification email could not be sent. Please use the resend verification option."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Account created. Check your email for the verification link.",
            requiresEmailVerification: true
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or username is already registered"
            });
        }

        next(error);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification link."
            });
        }

        if (!databaseReady(res)) return;

        const user = await User.findOne({
            emailVerificationTokenHash: hashToken(token),
            emailVerificationExpiresAt: { $gt: new Date() },
            isEmailVerified: false
        }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This verification link is invalid or expired. Please request a new one."
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationTokenHash = null;
        user.emailVerificationExpiresAt = null;

        await user.save();

        const accessToken = generateAccessToken(user._id.toString());

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You are now registered and logged in!",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !validEmail(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address"
            });
        }

        if (!databaseReady(res)) return;

        if (!isEmailConfigured()) {
            return res.status(503).json({
                success: false,
                message: "Email service is not configured yet."
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");

        // Same response whether the account exists or not.
        const response = {
            success: true,
            message: "If an unverified account exists for this email, a verification link has been sent."
        };

        if (!user || user.isEmailVerified) {
            return res.status(200).json(response);
        }

        const verification = createVerificationToken();

        user.emailVerificationTokenHash = verification.hash;
        user.emailVerificationExpiresAt = verification.expiresAt;

        await user.save();

        try {
            await sendVerificationEmail(
                user.email,
                user.name,
                verification.token
            );
        } catch (emailError) {
            console.error("Resend verification email failed:", emailError.message);

            return res.status(503).json({
                success: false,
                message: "Could not send verification email. Please try again later."
            });
        }

        return res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!validEmail(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address"
            });
        }

        if (!databaseReady(res)) return;

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in.",
                requiresEmailVerification: true
            });
        }

        const accessToken = generateAccessToken(user._id.toString());

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logged out. Remove the access token from the client."
    });
};

exports.getMe = (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

