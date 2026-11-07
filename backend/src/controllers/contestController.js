const mongoose = require("mongoose");

const Contest = require("../models/Contest");
const ContestParticipation = require("../models/ContestParticipation");

const { fetchLiveContests } = require("../services/contestService");

const supportedPlatforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

function databaseReady(res) {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            message: "Database is not connected yet"
        });
        return false;
    }

    return true;
}

// GET /api/contests/live?platform=codeforces&status=upcoming
exports.getLiveContests = async (req, res, next) => {
    try {
        const platform = (req.query.platform || "codeforces")
            .toLowerCase()
            .trim();

        if (!supportedPlatforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported platform"
            });
        }

        const contests = await fetchLiveContests(platform);

        const status = req.query.status;

        if (status && !["upcoming", "ongoing", "finished"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contest status"
            });
        }

        let filtered = status
            ? contests.filter(contest => contest.status === status)
            : contests;

        filtered.sort(
            (a, b) => a.startTime - b.startTime
        );

        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 50, 1),
            100
        );

        filtered = filtered.slice(0, limit);

        res.status(200).json({
            success: true,
            platform,
            count: filtered.length,
            contests: filtered
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/contests?platform=codeforces&status=upcoming
exports.getSavedContests = async (req, res, next) => {
    try {
        if (!databaseReady(res)) return;

        const filter = {};

        if (req.query.platform) {
            const platform = req.query.platform.toLowerCase();

            if (!supportedPlatforms.includes(platform)) {
                return res.status(400).json({
                    success: false,
                    message: "Unsupported platform"
                });
            }

            filter.platform = platform;
        }

        if (req.query.status) {
            if (!["upcoming", "ongoing", "finished"].includes(req.query.status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid contest status"
                });
            }

            filter.status = req.query.status;
        }

        if (req.query.from || req.query.to) {
            filter.startTime = {};

            if (req.query.from) {
                const from = new Date(req.query.from);

                if (Number.isNaN(from.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid from date"
                    });
                }

                filter.startTime.$gte = from;
            }

            if (req.query.to) {
                const to = new Date(req.query.to);

                if (Number.isNaN(to.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid to date"
                    });
                }

                filter.startTime.$lte = to;
            }
        }

        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 50, 1),
            100
        );

        const contests = await Contest.find(filter)
            .sort({ startTime: 1 })
            .limit(limit);

        res.status(200).json({
            success: true,
            count: contests.length,
            contests
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/contests/:id
exports.getContestById = async (req, res, next) => {
    try {
        if (!databaseReady(res)) return;

        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        res.status(200).json({
            success: true,
            contest
        });
    } catch (error) {
        next(error);
    }
};

// POST /api/contests/:id/participation
exports.updateParticipation = async (req, res, next) => {
    try {
        if (!databaseReady(res)) return;

        const { personalStatus, notes, reminderAt } = req.body;

        const allowedStatuses = [
            "planned",
            "registered",
            "attended",
            "missed"
        ];

        if (!allowedStatuses.includes(personalStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid participation status"
            });
        }

        if (notes !== undefined &&
            (typeof notes !== "string" || notes.length > 500)) {
            return res.status(400).json({
                success: false,
                message: "Notes must be a string of at most 500 characters"
            });
        }

        let parsedReminder = null;

        if (reminderAt !== undefined && reminderAt !== null) {
            parsedReminder = new Date(reminderAt);

            if (Number.isNaN(parsedReminder.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid reminder date"
                });
            }

            if (parsedReminder <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Reminder must be in the future"
                });
            }
        }

        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found"
            });
        }

        const participation = await ContestParticipation.findOneAndUpdate(
            {
                user: req.user._id,
                contest: contest._id
            },
            {
                $set: {
                    personalStatus,
                    ...(notes !== undefined ? { notes } : {}),
                    ...(reminderAt !== undefined
                        ? { reminderAt: parsedReminder }
                        : {})
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            success: true,
            message: "Contest participation updated",
            participation
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/contests/my/participation
exports.getMyParticipation = async (req, res, next) => {
    try {
        if (!databaseReady(res)) return;

        const records = await ContestParticipation.find({
            user: req.user._id
        })
            .populate("contest")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: records.length,
            participation: records
        });
    } catch (error) {
        next(error);
    }
};
