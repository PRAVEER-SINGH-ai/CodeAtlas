const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");

const LEETCODE_API = "https://leetcode.com/graphql/";

async function graphql(query, variables = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch(LEETCODE_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "https://leetcode.com",
                "Referer": "https://leetcode.com/",
                "User-Agent": "Mozilla/5.0 CodeAtlas/1.0",
                "Accept": "application/json"
            },
            body: JSON.stringify({ query, variables }),
            signal: controller.signal
        });

        if (!response.ok) {
            const error = new Error(
                `LeetCode API returned HTTP ${response.status}`
            );
            error.status = response.status === 429 ? 429 : 502;
            throw error;
        }

        const result = await response.json();

        if (result.errors?.length) {
            const message = result.errors
                .map(item => item.message)
                .filter(Boolean)
                .join("; ");

            throw new Error(message || "LeetCode GraphQL request failed");
        }

        if (!result.data) {
            throw new Error("LeetCode returned an empty profile response");
        }

        return result.data;
    } catch (error) {
        if (error.name === "AbortError") {
            const timeoutError = new Error("LeetCode request timed out");
            timeoutError.status = 504;
            throw timeoutError;
        }

        if (!error.status) error.status = 502;
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}

async function fetchProfile(handle) {
    if (!handle || typeof handle !== "string") {
        throw new Error("A valid LeetCode username is required");
    }

    const username = handle.trim();

    const query = `
        query userProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    realName
                    userAvatar
                    countryName
                    company
                    school
                    ranking
                }
                submitStats {
                    acSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                    totalSubmissionNum {
                        difficulty
                        count
                        submissions
                    }
                }
            }
            userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                topPercentage
            }
            userContestRankingHistory(username: $username) {
                attended
                rating
                ranking
                contest {
                    title
                    startTime
                }
            }
        }
    `;

    const data = await graphql(query, { username });
    const user = data.matchedUser;

    if (!user) {
        const error = new Error(
            `LeetCode username "${username}" was not found`
        );
        error.status = 404;
        throw error;
    }

    if (user.username?.toLowerCase() !== username.toLowerCase()) {
        throw new Error("LeetCode returned a different username");
    }

    const profile = user.profile || {};
    const contest = data.userContestRanking || {};
    const submissions = user.submitStats || {};

    const acceptedRows = submissions.acSubmissionNum || [];
    const totalRows = submissions.totalSubmissionNum || [];

    const acceptedAll = acceptedRows.find(
        item => item.difficulty === "All"
    );

    const totalAll = totalRows.find(
        item => item.difficulty === "All"
    );

    const history = (data.userContestRankingHistory || [])
        .filter(item => item && item.attended && item.contest?.startTime)
        .sort((a, b) => a.contest.startTime - b.contest.startTime);

    let previousRating = null;

    const ratingHistory = history.map(item => {
        const newRating = Number(item.rating);
        const date = new Date(Number(item.contest.startTime) * 1000);

        const entry = {
            contestId: String(item.contest.title),
            contestName: item.contest.title || "",
            rank: Number(item.ranking) || null,
            oldRating: previousRating,
            newRating: Number.isFinite(newRating) ? newRating : null,
            date
        };

        previousRating = entry.newRating;
        return entry;
    }).filter(item =>
        item.date instanceof Date &&
        !Number.isNaN(item.date.getTime())
    );

    const ratings = ratingHistory
        .map(item => item.newRating)
        .filter(value => Number.isFinite(value));

    const currentRating = Number(contest.rating);

    return {
        platform: "leetcode",
        handle: user.username,
        profileUrl: `https://leetcode.com/u/${encodeURIComponent(user.username)}/`,

        identity: {
            name: profile.realName || user.username,
            country: profile.countryName || null,
            organization: profile.company || profile.school || null,
            avatar: profile.userAvatar || null
        },

        stats: {
            rating: Number.isFinite(currentRating) && currentRating > 0
                ? currentRating
                : null,

            maxRating: ratings.length
                ? Math.max(...ratings)
                : (Number.isFinite(currentRating) && currentRating > 0
                    ? currentRating
                    : null),

            rank: Number(profile.ranking) || null,
            maxRank: null,

            problemsSolved: Number(acceptedAll?.count) || 0,
            contestsParticipated:
                Number(contest.attendedContestsCount) || 0,
            totalSubmissions: Number(totalAll?.submissions) || 0,
            acceptedSubmissions: Number(acceptedAll?.submissions) || 0
        },

        ratingHistory,
        fetchedAt: new Date()
    };
}

module.exports = { fetchProfile };

