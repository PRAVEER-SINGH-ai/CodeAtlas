require("dotenv").config();

const app = require("./app");
const mongoose = require("mongoose");

const { connectDB, disconnectDB } = require("./config/db");

const {
    startNotificationScheduler,
    stopNotificationScheduler
} = require("./jobs/notificationScheduler");

const PORT = process.env.PORT || 5000;

let server = null;
let shuttingDown = false;

async function startServer() {
    try {
        await connectDB();

        server = app.listen(PORT, () => {
            console.log(`CodeAtlas server running on port ${PORT}`);
            startNotificationScheduler();
        });
    } catch (error) {
        console.error(error.message);
        console.error("CodeAtlas server startup aborted.");
        process.exitCode = 1;
    }
}

async function shutdown(signal) {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`\nReceived ${signal}. Shutting down CodeAtlas...`);

    stopNotificationScheduler();

    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close(error => {
                    if (error) reject(error);
                    else resolve();
                });
            });
        }

        await disconnectDB();

        console.log("CodeAtlas shutdown complete.");
        process.exit(0);
    } catch (error) {
        console.error("Shutdown error:", error.message);
        process.exit(1);
    }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
