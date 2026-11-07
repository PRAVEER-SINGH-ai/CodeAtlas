const PlatformAccount = require("../models/PlatformAccount");
const StatsSnapshot = require("../models/StatsSnapshot");
const RatingHistory = require("../models/RatingHistory");

const { getAdapter } = require("./platformRegistry");
const { normalizeProfile } = require("./normalizationService");

async function syncAccount(accountId, userId) {
    const account = await PlatformAccount.findOne({
        _id: accountId,
        user: userId
    });

    if (!account) {
        const error = new Error("Platform account not found");
        error.status = 404;
        throw error;
    }

    account.syncStatus = "in_progress";
    account.syncError = null;
    await account.save();

    try {
        const adapter = getAdapter(account.platform);

        const rawProfile = await adapter.fetchProfile(account.handle);

        const profile = normalizeProfile(
            rawProfile,
            account.platform,
            account.handle
        );

        // Save the latest profile information.
        account.identity = profile.identity;
        account.currentStats = profile.stats;
        account.profileUrl = profile.profileUrl || account.profileUrl;
        account.lastSyncedAt = profile.fetchedAt;
        account.syncStatus = "success";
        account.syncError = null;

        await account.save();

        // Save a historical statistics snapshot.
        await StatsSnapshot.create({
            account: account._id,
            user: account.user,
            rating: profile.stats.rating,
            maxRating: profile.stats.maxRating,
            globalRank: null,
            countryRank: null,
            problemsSolved: profile.stats.problemsSolved,
      easyProblemsSolved: profile.stats.easyProblemsSolved || 0,
      mediumProblemsSolved: profile.stats.mediumProblemsSolved || 0,
      hardProblemsSolved: profile.stats.hardProblemsSolved || 0,
            contestsParticipated: profile.stats.contestsParticipated,
            totalSubmissions: profile.stats.totalSubmissions,
            acceptedSubmissions: profile.stats.acceptedSubmissions,
            capturedAt: profile.fetchedAt
        });

        // Insert new contest rating records or update existing ones.
        if (profile.ratingHistory.length) {
            const operations = profile.ratingHistory.map(item => ({
                updateOne: {
                    filter: {
                        account: account._id,
                        contestId: item.contestId
                    },
                    update: {
                        $set: {
                            user: account.user,
                            platform: account.platform,
                            contestName: item.contestName,
                            rank: item.rank,
                            oldRating: item.oldRating,
                            newRating: item.newRating,
                            date: item.date
                        }
                    },
                    upsert: true
                }
            }));

            await RatingHistory.bulkWrite(operations);
        }

        return {
            account,
            profile
        };
    } catch (error) {
        account.syncStatus = "failed";
        account.syncError = String(error.message || "Sync failed").slice(0, 500);

        await account.save();

        throw error;
    }
}

module.exports = { syncAccount };
