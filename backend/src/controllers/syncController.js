const PlatformAccount = require("../models/PlatformAccount");
const { syncAccount } = require("../services/syncService");

exports.syncOneAccount = async (req, res, next) => {
    try {
        const result = await syncAccount(
            req.params.id,
            req.user._id
        );

        res.status(200).json({
            success: true,
            message: "Account synchronized successfully",
            profile: result.profile
        });
    } catch (error) {
        next(error);
    }
};

exports.getSyncStatus = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select("platform handle syncStatus syncError lastSyncedAt");

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        res.status(200).json({
            success: true,
            account
        });
    } catch (error) {
        next(error);
    }
};
