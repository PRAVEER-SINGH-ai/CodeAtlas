const express = require("express");
const router = express.Router();

const { getPlatforms } = require("../controllers/platformController");
const { fetchProfile } = require("../controllers/profileController");

router.get("/", getPlatforms);
router.get("/:platform/profile/:handle", fetchProfile);

module.exports = router;
