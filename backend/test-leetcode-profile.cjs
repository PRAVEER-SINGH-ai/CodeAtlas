const adapter = require("./src/services/adapters/leetcodeAdapter");

(async () => {
    try {
        const handle = process.argv[2];

        console.log(`Fetching LeetCode profile: ${handle}\n`);

        const profile = await adapter.fetchProfile(handle);

        console.log("========== PROFILE SUCCESS ==========");
        console.log("Platform:", profile.platform);
        console.log("Handle:", profile.handle);
        console.log("Name:", profile.identity.name);
        console.log("Country:", profile.identity.country);
        console.log("Rating:", profile.stats.rating);
        console.log("Maximum rating:", profile.stats.maxRating);
        console.log("Global rank:", profile.stats.rank);
        console.log("Problems solved:", profile.stats.problemsSolved);
        console.log("Contests:", profile.stats.contestsParticipated);
        console.log("Total submissions:", profile.stats.totalSubmissions);
        console.log("Accepted submissions:", profile.stats.acceptedSubmissions);
        console.log("Rating history entries:", profile.ratingHistory.length);
        console.log("Profile URL:", profile.profileUrl);

    } catch (error) {
        console.error("\n========== PROFILE FAILED ==========");
        console.error("Status:", error.status || "Unknown");
        console.error("Reason:", error.message);
        console.error("Cause:", error.cause || "");
        process.exitCode = 1;
    }
})();
