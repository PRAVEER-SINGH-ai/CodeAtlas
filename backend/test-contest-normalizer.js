const { normalizeContests } = require("./src/services/contestNormalizer");

const now = Date.now();

const sample = [
    {
        contestId: "101",
        name: "Future Contest",
        url: "https://codeforces.com/contest/101",
        startTime: new Date(now + 86400000),
        durationSeconds: 7200
    },
    {
        contestId: "102",
        name: "Live Contest",
        url: "https://codeforces.com/contest/102",
        startTime: new Date(now - 1800000),
        durationSeconds: 7200
    },
    {
        contestId: "103",
        name: "Passed Contest",
        url: "https://codeforces.com/contest/103",
        startTime: new Date(now - 86400000),
        durationSeconds: 3600
    },
    {
        contestId: "101",
        name: "Duplicate Contest",
        startTime: new Date(now + 86400000),
        durationSeconds: 7200
    },
    {
        contestId: "",
        name: "Invalid Contest",
        startTime: new Date()
    }
];

const result = normalizeContests(sample, "codeforces");

console.log("\nNormalized contest results:");
console.table(result.map(c => ({
    id: c.contestId,
    name: c.name,
    status: c.status,
    duration: c.durationSeconds
})));

console.log("\nTotal valid contests:", result.length);
console.log("Duplicate removed:", result.length === 3);
console.log("Statuses correct:", 
    result.some(c => c.status === "upcoming") &&
    result.some(c => c.status === "ongoing") &&
    result.some(c => c.status === "finished")
);
