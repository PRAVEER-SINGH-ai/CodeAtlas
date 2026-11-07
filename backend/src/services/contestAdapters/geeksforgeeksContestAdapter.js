async function fetchContests() {
    const error = new Error(
        "GeeksforGeeks contest feed is not integrated yet."
    );
    error.status = 501;
    throw error;
}

module.exports = { fetchContests };
