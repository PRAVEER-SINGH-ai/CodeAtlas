const express = require("express");
const router = express.Router();

const {
    register,
    login,
    logout,
    getMe,
    verifyEmail,
    resendVerification
} = require("../controllers/authController");

const protect = require("../middleware/auth");

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
