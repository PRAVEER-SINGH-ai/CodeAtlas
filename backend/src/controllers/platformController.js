const platforms = [
    {
        id: "codeforces",
        name: "Codeforces",
        profileUrl: "https://codeforces.com/profile/"
    },
    {
        id: "leetcode",
        name: "LeetCode",
        profileUrl: "https://leetcode.com/u/"
    },
    {
        id: "codechef",
        name: "CodeChef",
        profileUrl: "https://www.codechef.com/users/"
    },
    {
        id: "atcoder",
        name: "AtCoder",
        profileUrl: "https://atcoder.jp/users/"
    },
    {
        id: "geeksforgeeks",
        name: "GeeksforGeeks",
        profileUrl: "https://www.geeksforgeeks.org/user/"
    }
];

exports.getPlatforms = (req, res) => {
    res.status(200).json({
        success: true,
        count: platforms.length,
        platforms
    });
};
