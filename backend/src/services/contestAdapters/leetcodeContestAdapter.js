function parseLeetCodeTimestamp(value) {
    if (value === null || value === undefined || value === "") return null;

    let date;

    if (typeof value === "number" || /^\d+$/.test(String(value))) {
        const n = Number(value);
        date = new Date(n < 100000000000 ? n * 1000 : n);
    } else {
        date = new Date(value);
    }

    return Number.isNaN(date.getTime()) ? null : date;
}

function parseLeetCodeContests(upcomingResponse, pastResponse, now = Date.now()) {
    const upcoming = upcomingResponse?.data?.topTwoContests;
    const past = pastResponse?.data?.pastContests?.data;

    if (!Array.isArray(upcoming) && !Array.isArray(past)) {
        throw new Error("No valid LeetCode contest feed");
    }

    const contests = new Map();

    if (Array.isArray(upcoming)) {
        for (const item of upcoming) {
            if (!item?.titleSlug || !item?.title) continue;

            const startTime = parseLeetCodeTimestamp(item.startTime);
            if (!startTime) continue;

            const duration = Number(item.duration);
            const durationSeconds =
                Number.isFinite(duration) && duration > 0 ? duration : null;

            let status = "upcoming";

            if (startTime.getTime() <= now) {
                if (durationSeconds === null) continue;

                status =
                    startTime.getTime() + durationSeconds * 1000 > now
                        ? "ongoing"
                        : "finished";
            }

            const slug = String(item.titleSlug);

            contests.set(slug, {
                platform: "leetcode",
                contestId: slug,
                name: String(item.title),
                url: `https://leetcode.com/contest/${slug}/`,
                startTime,
                durationSeconds,
                status
            });
        }
    }

    if (Array.isArray(past)) {
        for (const item of past) {
            if (!item?.titleSlug || !item?.title) continue;

            const startTime = parseLeetCodeTimestamp(
                item.startTime ?? item.originStartTime
            );

            if (!startTime) continue;

            const slug = String(item.titleSlug);

            if (!contests.has(slug)) {
                contests.set(slug, {
                    platform: "leetcode",
                    contestId: slug,
                    name: String(item.title),
                    url: `https://leetcode.com/contest/${slug}/`,
                    startTime,
                    durationSeconds: null,
                    status: "finished"
                });
            }
        }
    }

    return [...contests.values()].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );
}

async function graphQLRequest(query, variables = {}) {
    const response = await fetch("https://leetcode.com/graphql/", {
        method: "POST",
        signal: AbortSignal.timeout(15000),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "CodeAtlas/1.0",
            "Referer": "https://leetcode.com/contest/"
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error(`LeetCode HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.errors?.length) {
        throw new Error(data.errors[0].message);
    }

    if (!data.data) {
        throw new Error("No valid LeetCode contest feed");
    }

    return data;
}

async function fetchContests() {
    const upcomingQuery = `
        query {
            topTwoContests {
                title
                titleSlug
                startTime
                duration
            }
        }
    `;

    const pastQuery = `
        query pastContests($pageNo: Int, $numPerPage: Int) {
            pastContests(pageNo: $pageNo, numPerPage: $numPerPage) {
                pageNum
                currentPage
                totalNum
                numPerPage
                data {
                    title
                    titleSlug
                    startTime
                    originStartTime
                }
            }
        }
    `;

    const results = await Promise.allSettled([
        graphQLRequest(upcomingQuery),
        graphQLRequest(pastQuery, { pageNo: 1, numPerPage: 50 })
    ]);

    const upcomingResponse =
        results[0].status === "fulfilled" ? results[0].value : null;

    const pastResponse =
        results[1].status === "fulfilled" ? results[1].value : null;

    if (!upcomingResponse && !pastResponse) {
        throw new Error("Unable to fetch LeetCode contests");
    }

    const contests = parseLeetCodeContests(
        upcomingResponse,
        pastResponse
    );

    if (contests.length === 0) {
        throw new Error("No valid LeetCode contest feed");
    }

    return contests;
}

module.exports = {
    fetchContests,
    parseLeetCodeTimestamp,
    parseLeetCodeContests
};
