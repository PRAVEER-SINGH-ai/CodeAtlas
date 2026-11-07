const StatsSnapshot = require("../models/StatsSnapshot");
const PlatformAccount = require("../models/PlatformAccount");
const RatingHistory = require("../models/RatingHistory");
const LeetCodeGoal = require("../models/LeetCodeGoal");

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


exports.getContestHistory = async (req, res, next) => {
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

        const history = await RatingHistory.find({
            account: account._id,
            user: req.user._id
        }).sort({ date: 1 }).limit(2000).lean();

        res.status(200).json({
            success: true,
            count: history.length,
            history
        });
    } catch (error) {
        next(error);
    }
};

// GET /analytics/leetcode-goals/:accountId
exports.getLeetCodeGoals = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOne({
            _id: req.params.accountId,
            user: req.user._id,
            platform: "leetcode"
        });

        if (!account) {
            return res.status(404).json({ success: false, message: "LeetCode account not found" });
        }

        const goals = await LeetCodeGoal.find({
            user: req.user._id,
            account: account._id
        }).sort({ createdAt: -1 }).lean();

        const stats = account.currentStats || {};
        const result = goals.map(goal => {
            const current = Math.max(0, Number(stats[goal.metric]) || 0);
            return {
                ...goal,
                current,
                progress: Math.min(100, Math.round((current / goal.target) * 100)),
                completed: current >= goal.target
            };
        });

        res.status(200).json({ success: true, goals: result });
    } catch (error) {
        next(error);
    }
};

// POST /analytics/leetcode-goals/:accountId
exports.createLeetCodeGoal = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOne({
            _id: req.params.accountId,
            user: req.user._id,
            platform: "leetcode"
        });

        if (!account) {
            return res.status(404).json({ success: false, message: "LeetCode account not found" });
        }

        const allowed = [
            "problemsSolved", "easyProblemsSolved", "mediumProblemsSolved",
            "hardProblemsSolved", "rating", "contestsParticipated"
        ];
        const { title, metric, target, dueDate } = req.body || {};
        const amount = Number(target);

        if (!title || typeof title !== "string" || !allowed.includes(metric) ||
            !Number.isFinite(amount) || amount < 1 || amount > 10000000) {
            return res.status(400).json({
                success: false,
                message: "Provide a title, supported metric and a positive target."
            });
        }

        const goal = await LeetCodeGoal.create({
            user: req.user._id,
            account: account._id,
            title: title.trim().slice(0, 80),
            metric,
            target: amount,
            dueDate: dueDate ? new Date(dueDate) : null
        });

        const current = Math.max(0, Number(account.currentStats?.[metric]) || 0);

        res.status(201).json({
            success: true,
            goal: {
                ...goal.toObject(),
                current,
                progress: Math.min(100, Math.round((current / amount) * 100)),
                completed: current >= amount
            }
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /analytics/leetcode-goals/:goalId
exports.deleteLeetCodeGoal = async (req, res, next) => {
    try {
        const goal = await LeetCodeGoal.findOneAndDelete({
            _id: req.params.goalId,
            user: req.user._id
        });

        if (!goal) {
            return res.status(404).json({ success: false, message: "Goal not found" });
        }

        res.status(200).json({ success: true, message: "Goal deleted" });
    } catch (error) {
        next(error);
    }
};