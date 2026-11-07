const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    getLiveContests,
    getSavedContests,
    getContestById,
    updateParticipation,
    getMyParticipation
} = require("../controllers/contestController");

// Public endpoints
router.get("/live", getLiveContests);
router.get("/", getSavedContests);

// Protected personal endpoints
router.get("/my/participation", protect, getMyParticipation);
router.post("/:id/participation", protect, updateParticipation);

// Saved contest details
router.get("/:id", getContestById);

module.exports = router;
