const supportedPlatforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

function normalizeProfile(raw, expectedPlatform, expectedHandle) {
    if (!raw || typeof raw !== "object") {
        throw new Error("Platform returned an invalid profile");
    }

    if (raw.platform !== expectedPlatform) {
        throw new Error("Platform adapter returned an unexpected platform");
    }

    if (!supportedPlatforms.includes(expectedPlatform)) {
        throw new Error("Unsupported platform");
    }

    if (!raw.stats || typeof raw.stats !== "object") {
        throw new Error("Profile statistics are missing");
    }

    const stats = raw.stats;

    const numberOrNull = value => {
        if (value === null || value === undefined) return null;
        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    };

    const nonNegative = (value, field) => {
        const number = numberOrNull(value);

        if (number !== null && number < 0) {
            throw new Error(`Invalid ${field} value`);
        }

        return number;
    };

    const profile = {
        platform: expectedPlatform,
        handle: String(raw.handle || expectedHandle).trim(),
        profileUrl: raw.profileUrl || null,

        identity: {
            name: raw.identity?.name || null,
            country: raw.identity?.country || null,
            organization: raw.identity?.organization || null,
            avatar: raw.identity?.avatar || null
        },

        stats: {
            rating: numberOrNull(stats.rating),
            maxRating: numberOrNull(stats.maxRating),
            rank: stats.rank || null,
            maxRank: stats.maxRank || null,

            problemsSolved: nonNegative(
                stats.problemsSolved ?? 0,
                "problemsSolved"
            ),

            easyProblemsSolved: nonNegative(
                stats.easyProblemsSolved ?? 0,
                "easyProblemsSolved"
            ),

            mediumProblemsSolved: nonNegative(
                stats.mediumProblemsSolved ?? 0,
                "mediumProblemsSolved"
            ),

            hardProblemsSolved: nonNegative(
                stats.hardProblemsSolved ?? 0,
                "hardProblemsSolved"
            ),

            topicStats: Array.isArray(stats.topicStats)
                ? stats.topicStats
                    .filter(item => item && typeof item.name === "string" && typeof item.slug === "string")
                    .map(item => ({
                        name: item.name.slice(0, 100),
                        slug: item.slug.slice(0, 100),
                        solved: nonNegative(item.solved ?? 0, "topic solved"),
                        level: ["advanced", "intermediate", "fundamental"].includes(item.level)
                            ? item.level
                            : "unknown"
                    }))
                : [],
            contestsParticipated: nonNegative(
                stats.contestsParticipated ?? 0,
                "contestsParticipated"
            ),

            totalSubmissions: nonNegative(
                stats.totalSubmissions ?? 0,
                "totalSubmissions"
            ),

            acceptedSubmissions: nonNegative(
                stats.acceptedSubmissions ?? 0,
                "acceptedSubmissions"
            )
        },

        ratingHistory: [],
        fetchedAt: raw.fetchedAt ? new Date(raw.fetchedAt) : new Date()
    };

    if (profile.stats.rating !== null &&
        profile.stats.maxRating !== null &&
        profile.stats.rating < 0) {
        throw new Error("Invalid rating");
    }

    if (profile.stats.acceptedSubmissions > profile.stats.totalSubmissions) {
        throw new Error("Accepted submissions cannot exceed total submissions");
    }

    if (profile.stats.problemsSolved !== null &&
        !Number.isFinite(profile.stats.problemsSolved)) {
        throw new Error("Invalid problems solved count");
    }

    if (Array.isArray(raw.ratingHistory)) {
        profile.ratingHistory = raw.ratingHistory.map((item, index) => {
            if (!item.contestId || !item.date) {
                throw new Error(`Invalid rating history entry at index ${index}`);
            }

            const date = new Date(item.date);

            if (Number.isNaN(date.getTime())) {
                throw new Error(`Invalid contest date at index ${index}`);
            }

            return {
                contestId: String(item.contestId),
                contestName: item.contestName || "",
                rank: numberOrNull(item.rank),
                oldRating: numberOrNull(item.oldRating),
                newRating: numberOrNull(item.newRating),
                date
            };
        });
    }

    return profile;
}

module.exports = { normalizeProfile };

