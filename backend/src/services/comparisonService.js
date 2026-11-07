const { getAdapter } = require("./platformRegistry");
const { normalizeProfile } = require("./normalizationService");

const validPlatforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

function compareMetric(profiles, metric, label) {
    const values = profiles.map(profile => ({
        handle: profile.handle,
        platform: profile.platform,
        value: profile.stats[metric]
    }));

    const available = values.filter(item =>
        typeof item.value === "number" && Number.isFinite(item.value)
    );

    if (available.length < 2) {
        return {
            metric,
            label,
            comparable: false,
            message: "Insufficient data"
        };
    }

    const highest = Math.max(...available.map(item => item.value));
    const lowest = Math.min(...available.map(item => item.value));

    return {
        metric,
        label,
        comparable: true,
        values,
        highest,
        lowest,
        difference: highest - lowest,
        leaders: available
            .filter(item => item.value === highest)
            .map(item => item.handle)
    };
}

function buildComparison(profiles) {
    const samePlatform = profiles.every(
        profile => profile.platform === profiles[0].platform
    );

    const metrics = [
        compareMetric(profiles, "problemsSolved", "Problems solved"),
        compareMetric(profiles, "contestsParticipated", "Contests participated"),
        compareMetric(profiles, "totalSubmissions", "Total submissions"),
        compareMetric(profiles, "acceptedSubmissions", "Accepted submissions")
    ];

    const accuracyValues = profiles.map(profile => {
        const total = profile.stats.totalSubmissions;
        const accepted = profile.stats.acceptedSubmissions;

        return {
            handle: profile.handle,
            platform: profile.platform,
            value: total > 0 && accepted !== null
                ? Number(((accepted / total) * 100).toFixed(2))
                : null
        };
    });

    const validAccuracy = accuracyValues.filter(
        item => item.value !== null
    );

    const accuracy = {
        metric: "accuracy",
        label: "Submission accuracy (%)",
        comparable: validAccuracy.length >= 2,
        values: accuracyValues
    };

    if (accuracy.comparable) {
        accuracy.highest = Math.max(
            ...validAccuracy.map(item => item.value)
        );
        accuracy.lowest = Math.min(
            ...validAccuracy.map(item => item.value)
        );
    }

    metrics.push(accuracy);

    // Ratings are compared only within the same platform.
    if (samePlatform) {
        metrics.push(
            compareMetric(profiles, "rating", "Current rating"),
            compareMetric(profiles, "maxRating", "Maximum rating")
        );
    }

    return {
        profiles,
        samePlatform,
        ratingComparisonAvailable: samePlatform,
        metrics,
        note: samePlatform
            ? "Rating comparison is limited to profiles on the same platform."
            : "Cross-platform ratings are not directly comparable. Common metrics are shown separately."
    };
}

async function compareProfiles(requestedProfiles) {
    const results = await Promise.all(
        requestedProfiles.map(async item => {
            try {
                const platform = item.platform.toLowerCase().trim();
                const handle = item.handle.trim();

                if (!validPlatforms.includes(platform)) {
                    throw new Error("Unsupported platform");
                }

                const adapter = getAdapter(platform);
                const raw = await adapter.fetchProfile(handle);

                const normalized = normalizeProfile(
                    raw,
                    platform,
                    handle
                );

                return {
                    success: true,
                    profile: normalized
                };
            } catch (error) {
                return {
                    success: false,
                    platform: item.platform,
                    handle: item.handle,
                    message: error.message
                };
            }
        })
    );

    const successfulProfiles = results
        .filter(item => item.success)
        .map(item => item.profile);

    const failedProfiles = results
        .filter(item => !item.success)
        .map(item => ({
            platform: item.platform,
            handle: item.handle,
            message: item.message
        }));

    if (successfulProfiles.length < 2) {
        const error = new Error(
            "At least two profiles must be fetched successfully"
        );
        error.status = 502;
        error.details = failedProfiles;
        throw error;
    }

    return {
        comparison: buildComparison(successfulProfiles),
        failedProfiles
    };
}

module.exports = {
    compareMetric,
    buildComparison,
    compareProfiles
};
