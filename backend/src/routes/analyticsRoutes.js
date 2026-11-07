const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    getOverview,
    getHistory,
    getContestHistory,
    getLeetCodeGoals,
    createLeetCodeGoal,
    deleteLeetCodeGoal
} = require("../controllers/analyticsController");

router.use(protect);

router.get("/overview", getOverview);
router.get("/history/:accountId", getHistory);
router.get("/contest-history/:accountId", getContestHistory);
router.get("/leetcode-goals/:accountId", getLeetCodeGoals);
router.post("/leetcode-goals/:accountId", createLeetCodeGoal);
router.delete("/leetcode-goals/:goalId", deleteLeetCodeGoal);

module.exports = router;
