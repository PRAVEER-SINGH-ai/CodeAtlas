const assert = require("node:assert/strict");

const normalizer = require("./src/services/contestNormalizer");
const normalizeContests = normalizer.normalizeContests;

const platforms = [
    "codeforces",
    "atcoder",
    "codechef",
    "leetcode",
    "geeksforgeeks"
];

const adapters = {};

for (const platform of platforms) {
    adapters[platform] = require(
        `./src/services/contestAdapters/${platform}ContestAdapter`
    );

    assert.equal(
        typeof adapters[platform].fetchContests,
        "function",
        `${platform} must export fetchContests`
    );
}

console.log("All five adapter modules loaded successfully.");

const now = Date.now();
const future = new Date(now + 60 * 60 * 1000);

for (const platform of platforms.slice(0, 4)) {
    const raw = [{
        platform,
        contestId: `integration-${platform}`,
        name: `Integration Test ${platform}`,
        url: `https://example.com/${platform}`,
        startTime: future,
        durationSeconds: 7200,
        status: "upcoming"
    }];

    const result = normalizeContests(raw, platform);

    assert.ok(Array.isArray(result), `${platform}: result must be an array`);
    assert.equal(result.length, 1, `${platform}: one valid contest expected`);
    assert.equal(result[0].platform, platform);
    assert.equal(result[0].contestId, `integration-${platform}`);
    assert.equal(result[0].name, `Integration Test ${platform}`);
    assert.equal(result[0].status, "upcoming");

    console.log(`PASS: ${platform} -> shared normalizer`);
}

// Check that unsupported/invalid contest records are discarded.
const invalid = normalizeContests([
    {
        platform: "codeforces",
        contestId: "",
        name: "Invalid Contest",
        startTime: future,
        durationSeconds: 7200,
        status: "upcoming"
    }
], "codeforces");

assert.equal(invalid.length, 0);
console.log("PASS: invalid contest rejection");

// GeeksforGeeks currently has no integrated contest feed.
// Verify its intentional 501 response without making a network request.
(async () => {
    await assert.rejects(
        () => adapters.geeksforgeeks.fetchContests(),
        error => error.status === 501
    );

    console.log("PASS: GeeksforGeeks reports its unsupported feed honestly.");

    console.log("\nALL OFFLINE CONTEST INTEGRATION TESTS PASSED!");
    console.table([
        { platform: "Codeforces", result: "Module + normalizer contract" },
        { platform: "AtCoder", result: "Module + normalizer contract" },
        { platform: "CodeChef", result: "Module + normalizer contract" },
        { platform: "LeetCode", result: "Module + normalizer contract" },
        { platform: "GeeksforGeeks", result: "Expected HTTP 501 contract" }
    ]);
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
