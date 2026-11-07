const BASE_URL = "https://codeforces.com/api";

async function fetchContests() {
    const response = await fetch(`${BASE_URL}/contest.list?gym=false`, {
        signal: AbortSignal.timeout(15000),
        headers: {
            "User-Agent": "CodeAtlas/1.0"
        }
    });

    if (!response.ok) {
        throw new Error(`Codeforces API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
        throw new Error(data.comment || "Unable to fetch Codeforces contests");
    }

    const now = Date.now();

    return data.result.map(contest => {
        const startTime = new Date(contest.startTimeSeconds * 1000);
        const endTime = new Date(
            (contest.startTimeSeconds + contest.durationSeconds) * 1000
        );

        let status;

        if (contest.phase === "BEFORE") {
            status = "upcoming";
        } else if (contest.phase === "CODING") {
            status = "ongoing";
        } else {
            status = "finished";
        }

        // Use time boundaries as a fallback for status consistency.
        if (status === "upcoming" && startTime.getTime() <= now) {
            status = endTime.getTime() > now ? "ongoing" : "finished";
        }

        return {
            platform: "codeforces",
            contestId: String(contest.id),
            name: contest.name,
            url: `https://codeforces.com/contest/${contest.id}`,
            startTime,
            durationSeconds: contest.durationSeconds,
            status
        };
    });
}

module.exports = { fetchContests };
