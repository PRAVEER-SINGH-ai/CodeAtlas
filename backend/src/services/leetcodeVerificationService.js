const LEETCODE_URL = "https://leetcode.com/graphql/";

async function getPublicProfile(username) {
    const query = `
        query userPublicProfile($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    aboutMe
                }
            }
        }
    `;

    const response = await fetch(LEETCODE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Origin": "https://leetcode.com",
            "Referer": `https://leetcode.com/u/${encodeURIComponent(username)}/`,
            "User-Agent": "Mozilla/5.0 CodeAtlas/1.0"
        },
        body: JSON.stringify({
            query,
            variables: { username }
        }),
        signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
        throw new Error(`LeetCode returned HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.errors?.length) {
        throw new Error("LeetCode profile could not be retrieved.");
    }

    const matchedUser = result.data?.matchedUser;

    if (!matchedUser) {
        return null;
    }

    return {
        username: matchedUser.username,
        aboutMe: matchedUser.profile?.aboutMe || ""
    };
}

module.exports = { getPublicProfile };
