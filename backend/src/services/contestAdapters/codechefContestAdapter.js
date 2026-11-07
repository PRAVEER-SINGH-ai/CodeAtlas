function parseCodeChefDate(value) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
}

function parseCodeChefContests(data, now = Date.now()) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error("Invalid CodeChef API response");
    }

    const future = Array.isArray(data.future_contests)
        ? data.future_contests
        : [];

    const present = Array.isArray(data.present_contests)
        ? data.present_contests
        : [];

    const all = [...future, ...present];
    const seen = new Set();
    const contests = [];

    for (const item of all) {
        if (!item || typeof item !== "object") continue;

        const contestId = String(
            item.contest_code || ""
        ).trim();

        const name = String(
            item.contest_name || ""
        ).trim();

        if (!contestId || !name) continue;

        const key = contestId.toLowerCase();

        if (seen.has(key)) continue;

        const startTime = parseCodeChefDate(
            item.contest_start_date_iso ||
            item.contest_start_date
        );

        if (!startTime) continue;

        const apiDuration = Number(item.contest_duration);

        let durationSeconds = null;

        if (Number.isFinite(apiDuration) && apiDuration > 0) {
            // CodeChef contest_duration is expressed in minutes.
            durationSeconds = apiDuration * 60;
        } else {
            const endTime = parseCodeChefDate(
                item.contest_end_date_iso ||
                item.contest_end_date
            );

            if (endTime && endTime > startTime) {
                durationSeconds = Math.floor(
                    (endTime.getTime() - startTime.getTime()) / 1000
                );
            }
        }

        if (!durationSeconds || !Number.isFinite(durationSeconds)) {
            continue;
        }

        const start = startTime.getTime();
        const end = start + durationSeconds * 1000;

        const status = now < start
            ? "upcoming"
            : now < end
                ? "ongoing"
                : "finished";

        contests.push({
            platform: "codechef",
            contestId,
            name,
            url: `https://www.codechef.com/${encodeURIComponent(contestId)}`,
            startTime,
            durationSeconds,
            status
        });

        seen.add(key);
    }

    return contests.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
}

async function fetchContests() {
    const url =
        "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all";

    const response = await fetch(url, {
        signal: AbortSignal.timeout(15000),
        headers: {
            "User-Agent": "CodeAtlas/1.0",
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`CodeChef HTTP ${response.status}`);
    }

    const data = await response.json();
    const contests = parseCodeChefContests(data);

    if (!contests.length) {
        throw new Error(
            "No valid CodeChef contests found in API response"
        );
    }

    return contests;
}

module.exports = {
    fetchContests,
    parseCodeChefDate,
    parseCodeChefContests
};
