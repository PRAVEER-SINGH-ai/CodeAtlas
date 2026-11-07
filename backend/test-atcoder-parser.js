const assert = require("node:assert/strict");

const {
    parseAtCoderDate,
    parseContestRows
} = require("./src/services/contestAdapters/atcoderContestAdapter");

const date = parseAtCoderDate("2026-11-06 21:00:00 +0900");

assert.equal(date.toISOString(), "2026-11-06T12:00:00.000Z");
assert.equal(parseAtCoderDate("invalid"), null);
assert.equal(parseAtCoderDate("2026-02-31 21:00:00 +0900"), null);

const now = Date.parse("2026-11-06T12:00:00.000Z");

const html = `
<table>
<tr>
<td><a href="/contests/abc999">AtCoder Beginner Contest 999</a></td>
<td>2026-11-07 21:00:00 +0900</td>
<td>02:00</td>
</tr>
<tr>
<td><a href="/contests/abc999">Duplicate Contest</a></td>
<td>2026-11-07 21:00:00 +0900</td>
<td>02:00</td>
</tr>
<tr>
<td><a href="/contests/abc998">Invalid Date Contest</a></td>
<td>invalid date</td>
<td>02:00</td>
</tr>
<tr>
<td><a href="/contests/abc997">Past Contest</a></td>
<td>2026-11-05 21:00:00 +0900</td>
<td>02:00</td>
</tr>
</table>`;

const contests = parseContestRows(html, now);

assert.equal(contests.length, 2);
assert.equal(contests[0].contestId, "abc997");
assert.equal(contests[0].status, "finished");
assert.equal(contests[1].contestId, "abc999");
assert.equal(contests[1].status, "upcoming");
assert.equal(contests[1].durationSeconds, 7200);

console.log("All AtCoder parser tests passed!");
console.table(contests.map(c => ({
    id: c.contestId,
    name: c.name,
    status: c.status,
    duration: c.durationSeconds
})));
