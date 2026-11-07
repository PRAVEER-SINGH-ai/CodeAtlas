const crypto = require("crypto");
const { promisify } = require("util");

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = await scrypt(password, salt, 64);

    return `${salt}:${hash.toString("hex")}`;
}

async function comparePassword(password, storedPassword) {
    const [salt, originalHash] = storedPassword.split(":");

    if (!salt || !originalHash) return false;

    const hash = await scrypt(password, salt, 64);
    const originalBuffer = Buffer.from(originalHash, "hex");

    return originalBuffer.length === hash.length &&
        crypto.timingSafeEqual(hash, originalBuffer);
}

module.exports = { hashPassword, comparePassword };
