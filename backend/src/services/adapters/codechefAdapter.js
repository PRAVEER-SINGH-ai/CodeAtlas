function notImplemented(platform) {
    return async function fetchProfile() {
        const error = new Error(
            `${platform} adapter is not implemented yet`
        );
        error.status = 501;
        throw error;
    };
}

module.exports = {
    fetchProfile: notImplemented("CodeChef")
};
