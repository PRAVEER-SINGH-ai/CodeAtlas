const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");

const {
    addAccount,
    getAccounts,
    updateAccount,
    deleteAccount,
    startVerification,
    checkVerification
} = require("../controllers/accountController");

router.use(protect);

router.post("/:id/verification/start", startVerification);
router.post("/:id/verification/check", checkVerification);

router.route("/")
    .get(getAccounts)
    .post(addAccount);

router.route("/:id")
    .patch(updateAccount)
    .delete(deleteAccount);

module.exports = router;

