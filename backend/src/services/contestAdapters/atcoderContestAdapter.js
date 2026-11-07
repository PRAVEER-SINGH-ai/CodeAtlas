function parseAtCoderDate(value) {
    const match = String(value).match(
        /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s*([+-])(\d{2})(\d{2})$/
    );

    if (!match) return null;

    const [, y, mo, d, h, mi, s, sign, oh, om] = match;

    const year = Number(y);
    const month = Number(mo);
    const day = Number(d);
    const hour = Number(h);
    const minute = Number(mi);
    const second = Number(s);

    if (
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        hour > 23 || minute > 59 || second > 59 ||
        Number(oh) > 23 || Number(om) > 59
    ) return null;

    const utc = Date.UTC(
        year, month - 1, day, hour, minute, second
    );

    const check = new Date(utc);

    if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
    ) return null;

    const offset =
        (Number(oh) * 60 + Number(om)) *
        (sign === "+" ? 1 : -1);

    return new Date(utc - offset * 60000);
}

function decodeHtml(value) {
    return value
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function parseContestRows(html, now = Date.now()) {
    const rows = String(html).match(/<tr\b[\s\S]*?<\/tr>/gi) || [];
    const contests = [];
    const seen = new Set();

    for (const row of rows) {
        const anchor = row.match(
            /<a\b[^>]*href=["'](\/contests\/([^"'/?#]+))\/?["'][^>]*>([\s\S]*?)<\/a>/i
        );

        if (!anchor) continue;

        const id = anchor[2];

        if (!id || seen.has(id)) continue;

        const date = row.match(
            /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s*[+-]\d{4}/
        );

        if (!date) continue;

        const rowWithoutDate = row.replace(date[0], " ");

        const duration = rowWithoutDate.match(
            /\b(\d{1,3}):([0-5]\d)\b/
        );

        if (!duration) continue;

        const startTime = parseAtCoderDate(date[0]);

        if (!startTime) continue;

        const hours = Number(duration[1]);
        const minutes = Number(duration[2]);
        const durationSeconds = (hours * 60 + minutes) * 60;

        if (durationSeconds <= 0) continue;

        const name = decodeHtml(
            anchor[3]
                .replace(/<[^>]*>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
        );

        if (!name) continue;

        const start = startTime.getTime();
        const end = start + durationSeconds * 1000;

        contests.push({
            platform: "atcoder",
            contestId: id,
            name,
            url: `https://atcoder.jp/contests/${id}`,
            startTime,
            durationSeconds,
            status: now < start
                ? "upcoming"
                : now < end ? "ongoing" : "finished"
        });

        seen.add(id);
    }

    return contests.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
}

async function fetchContests() {
    const response = await fetch("https://atcoder.jp/contests?lang=en", {
        signal: AbortSignal.timeout(15000),
        headers: { "User-Agent": "CodeAtlas/1.0" }
    });

    if (!response.ok) {
        throw new Error(`AtCoder HTTP ${response.status}`);
    }

    const html = await response.text();
    const contests = parseContestRows(html);

    if (!contests.length) {
        throw new Error(
            "No AtCoder contests parsed; page format may have changed"
        );
    }

    return contests;
}

module.exports = {
    fetchContests,
    parseAtCoderDate,
    parseContestRows
};
