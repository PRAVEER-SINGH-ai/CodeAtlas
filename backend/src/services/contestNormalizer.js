const VALID_STATUSES = new Set([
    "upcoming",
    "ongoing",
    "finished"
]);

const VALID_PLATFORMS = new Set([
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
]);

function normalizeContests(contests, platform) {
    if (!Array.isArray(contests)) {
        throw new Error(`${platform} returned an invalid contest list`);
    }

    const normalizedPlatform = String(platform || "").toLowerCase();

    if (!VALID_PLATFORMS.has(normalizedPlatform)) {
        throw new Error("Unsupported contest platform");
    }

    const now = Date.now();
    const unique = new Map();

    for (const item of contests) {
        if (!item || typeof item !== "object") continue;

        const contestId = String(item.contestId ?? "").trim();
        const name = String(item.name ?? "").trim();
        const startTime = new Date(item.startTime);

        if (!contestId || !name || Number.isNaN(startTime.getTime())) {
            continue;
        }

        const rawDuration = Number(item.durationSeconds);

        const durationSeconds =
            Number.isFinite(rawDuration) && rawDuration > 0
                ? rawDuration
                : null;

        let status = String(item.status || "").toLowerCase();

        if (durationSeconds !== null) {
            const start = startTime.getTime();
            const end = start + durationSeconds * 1000;

            status = now < start
                ? "upcoming"
                : now < end
                    ? "ongoing"
                    : "finished";
        } else if (!VALID_STATUSES.has(status)) {
            continue;
        }

        let url = null;

        try {
            const parsedUrl = new URL(item.url);

            if (["http:", "https:"].includes(parsedUrl.protocol)) {
                url = parsedUrl.toString();
            }
        } catch {
            url = null;
        }

        const contest = {
            platform: normalizedPlatform,
            contestId,
            name,
            url,
            startTime,
            durationSeconds,
            status
        };

        const key = `${normalizedPlatform}:${contestId}`;

        if (!unique.has(key)) {
            unique.set(key, contest);
        }
    }

    return [...unique.values()].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
}

module.exports = { normalizeContests };
