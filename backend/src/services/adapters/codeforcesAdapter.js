const BASE_URL = "https://codeforces.com/api";

async function apiRequest(endpoint, params) {
    const query = new URLSearchParams(params).toString();

    const response = await fetch(`${BASE_URL}/${endpoint}?${query}`, {
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
        throw new Error(data.comment || "Codeforces API request failed");
    }

    return data.result;
}

async function fetchProfile(handle) {
    const [users, ratings, submissions] = await Promise.all([
        apiRequest("user.info", { handles: handle }),
        apiRequest("user.rating", { handle }),
        apiRequest("user.status", { handle, from: 1, count: 10000 })
    ]);

    if (!users.length) {
        throw new Error("Codeforces user not found");
    }

    const user = users[0];

    // Count unique problems with an accepted submission.
    const solvedProblems = new Set();

    for (const submission of submissions) {
        if (submission.verdict === "OK" && submission.problem) {
            const problem = submission.problem;
            solvedProblems.add(
                `${problem.contestId || "gym"}-${problem.index || problem.name}`
            );
        }
    }

    const latestRating = ratings.length
        ? ratings[ratings.length - 1].newRating
        : user.rating || null;

    const maxRating = user.maxRating || null;

    return {
        platform: "codeforces",
        handle: user.handle,
        profileUrl: `https://codeforces.com/profile/${encodeURIComponent(user.handle)}`,

        identity: {
            name: user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : null,
            country: user.country || null,
            organization: user.organization || null,
            avatar: user.titlePhoto || null
        },

        stats: {
            rating: latestRating,
            maxRating,
            rank: user.rank || null,
            maxRank: user.maxRank || null,
            problemsSolved: solvedProblems.size,
            contestsParticipated: ratings.length,
            totalSubmissions: submissions.length,
            acceptedSubmissions: submissions.filter(
                item => item.verdict === "OK"
            ).length
        },

        ratingHistory: ratings.map(item => ({
            contestId: item.contestId,
            contestName: item.contestName,
            rank: item.rank,
            oldRating: item.oldRating,
            newRating: item.newRating,
            date: new Date(item.ratingUpdateTimeSeconds * 1000)
        })),

        fetchedAt: new Date()
    };
}

module.exports = { fetchProfile };
