const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const {
    compare,
    compareUsers
} = require("../controllers/comparisonController");

// Existing external-profile comparison
router.post("/", protect, compare);

// New CodeAtlas user-to-user comparison
router.post("/users", protect, compareUsers);

module.exports = router;
