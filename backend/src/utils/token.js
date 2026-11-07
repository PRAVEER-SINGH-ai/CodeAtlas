const jwt = require("jsonwebtoken");

function generateAccessToken(userId) {
    if (!process.env.JWT_ACCESS_SECRET ||
        process.env.JWT_ACCESS_SECRET.startsWith("temporary_")) {
        throw new Error("Configure a secure JWT_ACCESS_SECRET in .env");
    }

    return jwt.sign(
        { sub: userId },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "15m" }
    );
}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

module.exports = { generateAccessToken, verifyAccessToken };
