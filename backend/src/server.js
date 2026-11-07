require("dotenv").config();

const app = require("./app");
const { connectDB, disconnectDB } = require("./config/db");
const {
  startNotificationScheduler,
  stopNotificationScheduler
} = require("./jobs/notificationScheduler");

const PORT = Number(process.env.PORT || 5000);

let server;
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n[SERVER] ${signal} received. Shutting down...`);

  try {
    stopNotificationScheduler();

    if (server) {
      await new Promise(resolve => server.close(resolve));
    }

    await disconnectDB();
    console.log("[SERVER] Shutdown complete.");
    process.exit(0);
  } catch (error) {
    console.error("[SERVER] Shutdown error:", error.message);
    process.exit(1);
  }
}

async function startServer() {
  try {
    console.log("\n================================");
    console.log("     CODEATLAS BACKEND STARTING");
    console.log("================================");

    await connectDB();

    server = app.listen(PORT, () => {
      console.log("\n[SERVER] Notification scheduler starting...");
      startNotificationScheduler();

      console.log(`[SERVER] Running at http://localhost:${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("[SERVER] Database-backed startup successful.\n");
    });

    server.on("error", async error => {
      console.error("[SERVER] Startup/listen error:", error.message);
      await shutdown("SERVER_ERROR");
    });

  } catch (error) {
    console.error("\n================================");
    console.error("     CODEATLAS STARTUP FAILED");
    console.error("================================");
    console.error("[DATABASE]", error.message);
    console.error("\nBackend was not started.");
    await disconnectDB().catch(() => {});
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

startServer();
