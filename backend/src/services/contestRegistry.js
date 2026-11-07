const adapters = {
    codeforces: require("./contestAdapters/codeforcesContestAdapter"),
    leetcode: require("./contestAdapters/leetcodeContestAdapter"),
    codechef: require("./contestAdapters/codechefContestAdapter"),
    atcoder: require("./contestAdapters/atcoderContestAdapter"),
    geeksforgeeks: require("./contestAdapters/geeksforgeeksContestAdapter")
};

function getContestAdapter(platform) {
    const adapter = adapters[platform];

    if (!adapter) {
        const error = new Error("Unsupported contest platform");
        error.status = 400;
        throw error;
    }

    return adapter;
}

module.exports = { getContestAdapter };
