const User = require("../models/User");
const PlatformAccount = require("../models/PlatformAccount");
const { compareProfiles } = require("../services/comparisonService");

exports.compare = async (req, res, next) => {
    try {
        const { profiles } = req.body;

        if (!Array.isArray(profiles) ||
            profiles.length < 2 ||
            profiles.length > 5) {
            return res.status(400).json({
                success: false,
                message: "Provide between 2 and 5 profiles"
            });
        }

        for (const item of profiles) {
            if (
                !item ||
                typeof item.platform !== "string" ||
                typeof item.handle !== "string" ||
                !item.platform.trim() ||
                !item.handle.trim() ||
                item.handle.trim().length > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Every profile needs a valid platform and handle"
                });
            }
        }

        const result = await compareProfiles(profiles);

        res.status(200).json({
            success: true,
            message: "Comparison generated",
            ...result
        });
    } catch (error) {
        next(error);
    }
};

exports.compareUsers = async (req, res, next) => {
    try {
        const { username1, username2 } = req.body;

        if (
            typeof username1 !== "string" ||
            typeof username2 !== "string" ||
            !username1.trim() ||
            !username2.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Enter both CodeAtlas usernames."
            });
        }

        const firstUsername = username1.trim().toLowerCase();
        const secondUsername = username2.trim().toLowerCase();

        if (firstUsername === secondUsername) {
            return res.status(400).json({
                success: false,
                message: "You must compare two different CodeAtlas users."
            });
        }

        const [firstUser, secondUser] = await Promise.all([
            User.findOne({ username: firstUsername })
                .select("_id username name"),
            User.findOne({ username: secondUsername })
                .select("_id username name")
        ]);

        if (!firstUser || !secondUser) {
            return res.status(404).json({
                success: false,
                message: "One or both CodeAtlas usernames were not found."
            });
        }

        if (firstUser._id.equals(secondUser._id)) {
            return res.status(400).json({
                success: false,
                message: "You must compare two different CodeAtlas users."
            });
        }

        const accounts = await PlatformAccount.find({
            user: { $in: [firstUser._id, secondUser._id] },
            isVerified: true
        }).select(
            "user platform handle profileUrl currentStats lastSyncedAt isVerified"
        );

        const publicUser = (user) => ({
            id: user._id,
            username: user.username,
            name: user.name,
            accounts: accounts
                .filter(account => account.user.equals(user._id))
                .map(account => ({
                    platform: account.platform,
                    handle: account.handle,
                    profileUrl: account.profileUrl,
                    isVerified: account.isVerified,
                    currentStats: {
                        rating: account.currentStats?.rating ?? null,
                        maxRating: account.currentStats?.maxRating ?? null,
                        problemsSolved: account.currentStats?.problemsSolved ?? null,
                        contestsParticipated: account.currentStats?.contestsParticipated ?? null,
                        totalSubmissions: account.currentStats?.totalSubmissions ?? null,
                        acceptedSubmissions: account.currentStats?.acceptedSubmissions ?? null
                    },
                    lastSyncedAt: account.lastSyncedAt
                }))
        });

        const left = publicUser(firstUser);
        const right = publicUser(secondUser);

        const platforms = [
            "codeforces",
            "leetcode",
            "codechef",
            "atcoder",
            "geeksforgeeks"
        ];

        const metricDefinitions = [
            { key: "rating", label: "Current rating", samePlatformOnly: true },
            { key: "maxRating", label: "Maximum rating", samePlatformOnly: true },
            { key: "problemsSolved", label: "Problems solved" },
            { key: "contestsParticipated", label: "Contests participated" },
            { key: "totalSubmissions", label: "Total submissions" },
            { key: "acceptedSubmissions", label: "Accepted submissions" }
        ];

        const comparisons = platforms.map(platform => {
            const account1 = left.accounts.find(a => a.platform === platform) || null;
            const account2 = right.accounts.find(a => a.platform === platform) || null;

            const metrics = metricDefinitions.map(definition => {
                const value1 = account1?.currentStats?.[definition.key] ?? null;
                const value2 = account2?.currentStats?.[definition.key] ?? null;

                const comparable =
                    typeof value1 === "number" &&
                    Number.isFinite(value1) &&
                    typeof value2 === "number" &&
                    Number.isFinite(value2);

                return {
                    key: definition.key,
                    label: definition.label,
                    value1,
                    value2,
                    comparable,
                    leader: comparable
                        ? value1 === value2 ? "tie" : value1 > value2 ? "user1" : "user2"
                        : null,
                    difference: comparable ? Math.abs(value1 - value2) : null
                };
            });

            return {
                platform,
                account1,
                account2,
                connectedByBoth: Boolean(account1 && account2),
                metrics
            };
        });

        return res.status(200).json({
            success: true,
            users: {
                user1: left,
                user2: right
            },
            comparisons,
            note: "Only verified platform accounts are included. Missing or unavailable statistics are not treated as zero."
        });
    } catch (error) {
        next(error);
    }
};
