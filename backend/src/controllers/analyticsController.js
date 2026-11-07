const StatsSnapshot = require("../models/StatsSnapshot");
const PlatformAccount = require("../models/PlatformAccount");

exports.getOverview = async (req, res, next) => {
    try {
        const accounts = await PlatformAccount.find({
            user: req.user._id
        }).select("_id platform handle");

        const accountIds = accounts.map(account => account._id);

        const latestSnapshots = await StatsSnapshot.aggregate([
            {
                $match: {
                    user: req.user._id,
                    account: { $in: accountIds }
                }
            },
            { $sort: { capturedAt: -1 } },
            {
                $group: {
                    _id: "$account",
                    latest: { $first: "$$ROOT" }
                }
            }
        ]);

        const totals = latestSnapshots.reduce((result, item) => {
            const stats = item.latest;

            result.problemsSolved += stats.problemsSolved || 0;
            result.contestsParticipated += stats.contestsParticipated || 0;
            result.totalSubmissions += stats.totalSubmissions || 0;
            result.acceptedSubmissions += stats.acceptedSubmissions || 0;

            return result;
        }, {
            problemsSolved: 0,
            contestsParticipated: 0,
            totalSubmissions: 0,
            acceptedSubmissions: 0
        });

        res.status(200).json({
            success: true,
            connectedAccounts: accounts.length,
            totals,
            accounts,
            snapshots: latestSnapshots
        });
    } catch (error) {
        next(error);
    }
};

exports.getHistory = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOne({
            _id: req.params.accountId,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        const history = await StatsSnapshot.find({
            account: account._id,
            user: req.user._id
        }).sort({ capturedAt: 1 }).limit(500);

        res.status(200).json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        next(error);
    }
};
