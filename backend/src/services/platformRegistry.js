const adapters = {
    codeforces: require("./adapters/codeforcesAdapter"),
    leetcode: require("./adapters/leetcodeAdapter"),
    codechef: require("./adapters/codechefAdapter"),
    atcoder: require("./adapters/atcoderAdapter"),
    geeksforgeeks: require("./adapters/geeksforgeeksAdapter")
};

function getAdapter(platform) {
    const adapter = adapters[platform.toLowerCase()];

    if (!adapter) {
        const error = new Error("Unsupported platform");
        error.status = 400;
        throw error;
    }

    return adapter;
}

module.exports = { getAdapter };
