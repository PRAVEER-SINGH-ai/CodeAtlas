const PlatformAccount = require("../models/PlatformAccount");

const supportedPlatforms = [
    "codeforces",
    "leetcode",
    "codechef",
    "atcoder",
    "geeksforgeeks"
];

function makeProfileUrl(platform, handle) {
    const urls = {
        codeforces: "https://codeforces.com/profile/",
        leetcode: "https://leetcode.com/u/",
        codechef: "https://www.codechef.com/users/",
        atcoder: "https://atcoder.jp/users/",
        geeksforgeeks: "https://www.geeksforgeeks.org/user/"
    };

    return urls[platform] + encodeURIComponent(handle);
}

exports.addAccount = async (req, res, next) => {
    try {
        const { platform, handle } = req.body;

        if (!platform || !handle) {
            return res.status(400).json({
                success: false,
                message: "Platform and handle are required"
            });
        }

        const normalizedPlatform = platform.toLowerCase().trim();
        const normalizedHandle = handle.trim();

        if (!supportedPlatforms.includes(normalizedPlatform)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported platform"
            });
        }

        if (normalizedHandle.length < 2 || normalizedHandle.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Handle must contain 2 to 100 characters"
            });
        }

        const account = await PlatformAccount.create({
            user: req.user._id,
            platform: normalizedPlatform,
            handle: normalizedHandle,
            profileUrl: makeProfileUrl(normalizedPlatform, normalizedHandle)
        });

        res.status(201).json({
            success: true,
            message: "Platform account added. Verification is pending.",
            account
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This platform account is already connected"
            });
        }

        next(error);
    }
};

exports.getAccounts = async (req, res, next) => {
    try {
        const accounts = await PlatformAccount.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: accounts.length,
            accounts
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAccount = async (req, res, next) => {
    try {
        const { handle } = req.body;

        if (!handle || handle.trim().length < 2 || handle.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid handle"
            });
        }

        const account = await PlatformAccount.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            {
                handle: handle.trim(),
                profileUrl: makeProfileUrl(
                    req.body.platform || "codeforces",
                    handle.trim()
                ),
                verificationStatus: "pending",
                isVerified: false,
                syncStatus: "never_synced",
                lastSyncedAt: null
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Account updated",
            account
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteAccount = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Platform account removed"
        });
    } catch (error) {
        next(error);
    }
};

const crypto = require("crypto");
const { getPublicProfile } = require("../services/leetcodeVerificationService");

exports.startVerification = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        if (account.platform !== "leetcode") {
            return res.status(400).json({
                success: false,
                message: "Verification is currently available only for LeetCode."
            });
        }

        if (account.isVerified) {
            return res.status(400).json({
                success: false,
                message: "This account is already verified."
            });
        }

        const code = `CODEATLAS-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

        account.verificationCodeHash = crypto
            .createHash("sha256")
            .update(code)
            .digest("hex");

        account.verificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
        account.verificationStatus = "pending";

        await account.save();

        return res.status(200).json({
            success: true,
            message: "Verification code generated.",
            code,
            expiresAt: account.verificationExpiresAt,
            instructions: "Add this exact code to your public LeetCode profile About Me section, then return and verify."
        });
    } catch (error) {
        next(error);
    }
};

exports.checkVerification = async (req, res, next) => {
    try {
        const account = await PlatformAccount.findOne({
            _id: req.params.id,
            user: req.user._id
        }).select("+verificationCodeHash");

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        if (account.platform !== "leetcode") {
            return res.status(400).json({
                success: false,
                message: "Verification is currently available only for LeetCode."
            });
        }

        if (account.isVerified) {
            return res.status(200).json({
                success: true,
                message: "Account is already verified.",
                account
            });
        }

        const { code } = req.body;

        if (!code || !account.verificationCodeHash) {
            return res.status(400).json({
                success: false,
                message: "Generate a verification code first."
            });
        }

        if (
            !account.verificationExpiresAt ||
            account.verificationExpiresAt.getTime() < Date.now()
        ) {
            account.verificationCodeHash = null;
            account.verificationExpiresAt = null;
            await account.save();

            return res.status(400).json({
                success: false,
                message: "Verification code expired. Generate a new one."
            });
        }

        const suppliedHash = crypto
            .createHash("sha256")
            .update(String(code).trim())
            .digest("hex");

        const expected = Buffer.from(account.verificationCodeHash, "hex");
        const supplied = Buffer.from(suppliedHash, "hex");

        if (
            expected.length !== supplied.length ||
            !crypto.timingSafeEqual(expected, supplied)
        ) {
            return res.status(400).json({
                success: false,
                message: "Incorrect verification code."
            });
        }

        const profile = await getPublicProfile(account.handle);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "LeetCode profile not found. Check your username."
            });
        }

        if (profile.username.toLowerCase() !== account.handle.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: "The returned LeetCode username does not match."
            });
        }

        if (!profile.aboutMe.includes(String(code).trim())) {
            return res.status(400).json({
                success: false,
                message: "Verification code was not found in the public LeetCode About Me section. Save your profile changes and try again."
            });
        }

        account.isVerified = true;
        account.verificationStatus = "verified";
        account.verificationCodeHash = null;
        account.verificationExpiresAt = null;

        await account.save();

        return res.status(200).json({
            success: true,
            message: "LeetCode account ownership verified successfully.",
            account
        });
    } catch (error) {
        next(error);
    }
};

