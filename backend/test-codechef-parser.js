const assert = require("node:assert/strict");

const {
    parseCodeChefDate,
    parseCodeChefContests
} = require("./src/services/contestAdapters/codechefContestAdapter");

const now = Date.parse("2026-11-06T12:00:00.000Z");

assert.equal(parseCodeChefDate("invalid"), null);

const data = {
    future_contests: [
        {
            contest_code: "FUTURE1",
            contest_name: "Future Contest",
            contest_start_date_iso: "2026-11-07T12:00:00Z",
            contest_duration: "120"
        },
        {
            contest_code: "DUPLICATE",
            contest_name: "Duplicate One",
            contest_start_date_iso: "2026-11-08T12:00:00Z",
            contest_duration: "60"
        },
        {
            contest_code: "",
            contest_name: "Invalid Contest",
            contest_start_date_iso: "2026-11-08T12:00:00Z",
            contest_duration: "60"
        },
        {
            contest_code: "FALLBACK",
            contest_name: "End Time Fallback",
            contest_start_date_iso: "2026-11-09T12:00:00Z",
            contest_end_date_iso: "2026-11-09T14:00:00Z",
            contest_duration: "invalid"
        }
    ],
    present_contests: [
        {
            contest_code: "LIVE1",
            contest_name: "Live Contest",
            contest_start_date_iso: "2026-11-06T11:00:00Z",
            contest_duration: "120"
        },
        {
            contest_code: "DUPLICATE",
            contest_name: "Duplicate Two",
            contest_start_date_iso: "2026-11-08T12:00:00Z",
            contest_duration: "60"
        },
        {
            contest_code: "PAST1",
            contest_name: "Finished Contest",
            contest_start_date: "2026-11-05T12:00:00Z",
            contest_duration: "60"
        }
    ]
};

const result = parseCodeChefContests(data, now);

assert.equal(result.length, 5);

const byId = Object.fromEntries(
    result.map(item => [item.contestId, item])
);

assert.equal(byId.FUTURE1.status, "upcoming");
assert.equal(byId.LIVE1.status, "ongoing");
assert.equal(byId.PAST1.status, "finished");

assert.equal(byId.FUTURE1.durationSeconds, 7200);
assert.equal(byId.FALLBACK.durationSeconds, 7200);

assert.equal(
    result.filter(item => item.contestId === "DUPLICATE").length,
    1
);

assert.equal(byId.FUTURE1.platform, "codechef");

assert.throws(
    () => parseCodeChefContests(null, now),
    /Invalid CodeChef API response/
);

console.log("All CodeChef parser tests passed!");

console.table(result.map(c => ({
    id: c.contestId,
    name: c.name,
    status: c.status,
    duration: c.durationSeconds
})));
