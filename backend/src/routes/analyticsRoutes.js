const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    getOverview,
    getHistory
} = require("../controllers/analyticsController");

router.use(protect);

router.get("/overview", getOverview);
router.get("/history/:accountId", getHistory);

module.exports = router;
