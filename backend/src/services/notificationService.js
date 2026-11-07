const Notification = require("../models/Notification");

async function createNotification({
    user,
    type,
    title,
    message,
    data = {},
    dedupeKey = null
}) {
    if (dedupeKey) {
        return Notification.findOneAndUpdate(
            { user, dedupeKey },
            {
                $setOnInsert: {
                    user,
                    type,
                    title,
                    message,
                    data,
                    dedupeKey
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );
    }

    return Notification.create({
        user,
        type,
        title,
        message,
        data
    });
}

module.exports = { createNotification };
