const fs = require("fs");
const source = fs.readFileSync(
    "./src/services/contestAdapters/atcoderContestAdapter.js", "utf8"
);

const start = source.indexOf("function parseAtCoderDate");
const end = source.indexOf("\n}", start) + 2;

if (start < 0 || end < 2) throw Error("Parser not found");

const parserCode = source.slice(start, end);
const parseAtCoderDate = new Function(
    parserCode + "\nreturn parseAtCoderDate;"
)();

const date = parseAtCoderDate("2026-11-06 21:00:00 +0900");

console.log("Parsed:", date);
console.log("UTC:", date.toISOString());
console.log("Valid:", !Number.isNaN(date.getTime()));

if (date.toISOString() !== "2026-11-06T12:00:00.000Z") {
    throw Error("Timezone conversion incorrect");
}
