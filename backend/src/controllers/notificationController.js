const Notification = require("../models/Notification");

exports.getNotifications = async (req, res, next) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || 20, 1),
            100
        );

        const filter = { user: req.user._id };

        if (req.query.unread === "true") {
            filter.readAt = null;
        }

        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),

            Notification.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            page,
            limit,
            total,
            notifications
        });
    } catch (error) {
        next(error);
    }
};

exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            readAt: null
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user._id
            },
            {
                $set: { readAt: new Date() }
            },
            {
                new: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        const result = await Notification.updateMany(
            {
                user: req.user._id,
                readAt: null
            },
            {
                $set: { readAt: new Date() }
            }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification deleted"
        });
    } catch (error) {
        next(error);
    }
};
