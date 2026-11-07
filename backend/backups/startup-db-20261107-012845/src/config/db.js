const mongoose = require("mongoose");

let eventsRegistered = false;

function registerConnectionEvents() {
    if (eventsRegistered) return;

    mongoose.connection.on("connected", () => {
        console.log(
            `MongoDB connected: ${mongoose.connection.name}`
        );
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected.");
    });

    mongoose.connection.on("error", error => {
        console.error("MongoDB connection error:", error.message);
    });

    eventsRegistered = true;
}

async function connectDB() {
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
        console.warn(
            "MONGODB_URI not configured. Starting in database-disabled mode."
        );
        return false;
    }

    if (mongoose.connection.readyState === 1) {
        return true;
    }

    registerConnectionEvents();

    const dbName = process.env.MONGODB_DB_NAME || "codeatlas";

    const timeout = Math.max(
        Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 10000,
        5000
    );

    try {
        await mongoose.connect(uri, {
            dbName,
            serverSelectionTimeoutMS: timeout
        });

        console.log(`Database selected: ${mongoose.connection.name}`);

        return true;
    } catch (error) {
        throw new Error(`MongoDB connection failed: ${error.message}`);
    }
}

async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("MongoDB disconnected successfully.");
    }
}

module.exports = {
    connectDB,
    disconnectDB
};
