const { getAdapter } = require("../services/platformRegistry");

exports.fetchProfile = async (req, res, next) => {
    try {
        const platform = req.params.platform.toLowerCase().trim();
        const handle = req.params.handle.trim();

        if (!handle || handle.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Invalid platform handle"
            });
        }

        const adapter = getAdapter(platform);
        const profile = await adapter.fetchProfile(handle);

        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        next(error);
    }
};
