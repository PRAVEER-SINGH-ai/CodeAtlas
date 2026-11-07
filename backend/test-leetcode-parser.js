const assert = require("node:assert/strict");

const {
    parseLeetCodeTimestamp,
    parseLeetCodeContests
} = require("./src/services/contestAdapters/leetcodeContestAdapter");

const now = Date.parse("2026-11-06T12:00:00.000Z");

assert.equal(
    parseLeetCodeTimestamp(1794000000).toISOString(),
    new Date(1794000000 * 1000).toISOString()
);

assert.equal(parseLeetCodeTimestamp("invalid"), null);
assert.equal(parseLeetCodeTimestamp(null), null);

const upcomingResponse = {
    data: {
        topTwoContests: [
            {
                title: "Weekly Contest 527",
                titleSlug: "weekly-contest-527",
                startTime: Math.floor((now + 86400000) / 1000),
                duration: 5400
            },
            {
                title: "Biweekly Contest 195",
                titleSlug: "biweekly-contest-195",
                startTime: Math.floor((now - 1800000) / 1000),
                duration: 5400
            }
        ]
    }
};

const pastResponse = {
    data: {
        pastContests: {
            data: [
                {
                    title: "Weekly Contest 526",
                    titleSlug: "weekly-contest-526",
                    startTime: Math.floor((now - 86400000) / 1000)
                },
                {
                    title: "Weekly Contest 527 Duplicate",
                    titleSlug: "weekly-contest-527",
                    startTime: Math.floor((now + 86400000) / 1000)
                },
                {
                    title: "Invalid Contest",
                    titleSlug: "invalid-contest",
                    startTime: "invalid"
                }
            ]
        }
    }
};

const result = parseLeetCodeContests(
    upcomingResponse,
    pastResponse,
    now
);

assert.equal(result.length, 3);

const byId = Object.fromEntries(
    result.map(item => [item.contestId, item])
);

assert.equal(byId["weekly-contest-527"].status, "upcoming");
assert.equal(byId["biweekly-contest-195"].status, "ongoing");
assert.equal(byId["weekly-contest-526"].status, "finished");

assert.equal(
    byId["biweekly-contest-195"].durationSeconds,
    5400
);

assert.equal(
    result.filter(item => item.contestId === "weekly-contest-527").length,
    1
);

assert.equal(
    byId["weekly-contest-526"].durationSeconds,
    null
);

const pastOnly = parseLeetCodeContests(
    null,
    pastResponse,
    now
);

assert.equal(pastOnly.length, 2);
assert.equal(pastOnly[0].status, "finished");

assert.throws(
    () => parseLeetCodeContests(null, null, now),
    /No valid LeetCode contest feed/
);

console.log("All LeetCode parser tests passed!");

console.table(result.map(c => ({
    id: c.contestId,
    name: c.name,
    status: c.status,
    duration: c.durationSeconds
})));

