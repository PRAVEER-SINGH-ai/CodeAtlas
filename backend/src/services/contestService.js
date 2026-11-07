const Contest = require("../models/Contest");
const { getContestAdapter } = require("./contestRegistry");
const { normalizeContests } = require("./contestNormalizer");

const supportedPlatforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

async function fetchLiveContests(platform) {
    const normalized = String(platform || "").toLowerCase().trim();

    if (!supportedPlatforms.includes(normalized)) {
        const error = new Error("Unsupported platform");
        error.status = 400;
        throw error;
    }

    const adapter = getContestAdapter(normalized);
    const rawContests = await adapter.fetchContests();

    return normalizeContests(rawContests, normalized);
}

async function saveContests(contests) {
    if (!Array.isArray(contests) || contests.length === 0) {
        return { insertedOrUpdated: 0 };
    }

    const operations = contests.map(contest => ({
        updateOne: {
            filter: {
                platform: contest.platform,
                contestId: contest.contestId
            },
            update: {
                $set: {
                    name: contest.name,
                    url: contest.url,
                    startTime: contest.startTime,
                    durationSeconds: contest.durationSeconds,
                    status: contest.status
                }
            },
            upsert: true
        }
    }));

    const result = await Contest.bulkWrite(operations);

    return {
        insertedOrUpdated:
            result.upsertedCount + result.modifiedCount
    };
}

module.exports = {
    fetchLiveContests,
    saveContests
};
