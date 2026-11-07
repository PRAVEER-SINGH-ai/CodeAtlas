const mongoose = require("mongoose");

const ContestParticipation = require("../models/ContestParticipation");
const { createNotification } = require("../services/notificationService");

let running = false;
let timer = null;

async function processContestReminders() {
    if (running || mongoose.connection.readyState !== 1) {
        return;
    }

    running = true;

    try {
        const now = new Date();

        const dueReminders = await ContestParticipation.find({
            reminderAt: { $lte: now, $ne: null },
            reminderSentAt: null
        }).populate("contest");

        for (const participation of dueReminders) {
            if (!participation.contest) continue;

            try {
                const contest = participation.contest;

                await createNotification({
                    user: participation.user,
                    type: "contest_reminder",
                    title: "Contest reminder",
                    message: `${contest.name} is scheduled to start at ${contest.startTime.toISOString()}.`,
                    data: {
                        contestId: contest._id,
                        contestName: contest.name,
                        platform: contest.platform,
                        contestUrl: contest.url,
                        startTime: contest.startTime
                    },
                    dedupeKey: `contest-reminder:${participation._id}`
                });

                participation.reminderSentAt = new Date();
                await participation.save();

                console.log(
                    `Contest reminder processed: ${contest.name}`
                );
            } catch (error) {
                console.error(
                    `Reminder failed for ${participation._id}:`,
                    error.message
                );
            }
        }
    } catch (error) {
        console.error("Reminder scheduler error:", error.message);
    } finally {
        running = false;
    }
}

function startNotificationScheduler() {
    if (timer) {
        return timer;
    }

    const interval = Math.max(
        Number(process.env.NOTIFICATION_POLL_INTERVAL_MS) || 60000,
        10000
    );

    console.log(
        `Notification scheduler started. Poll interval: ${interval}ms`
    );

    processContestReminders();

    timer = setInterval(processContestReminders, interval);
    timer.unref();

    return timer;
}

function stopNotificationScheduler() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        console.log("Notification scheduler stopped.");
    }
}

module.exports = {
    startNotificationScheduler,
    stopNotificationScheduler,
    processContestReminders
};
