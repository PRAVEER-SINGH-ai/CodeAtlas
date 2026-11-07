const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    syncOneAccount,
    getSyncStatus
} = require("../controllers/syncController");

router.use(protect);

router.post("/:id", syncOneAccount);
router.get("/:id/status", getSyncStatus);

module.exports = router;
