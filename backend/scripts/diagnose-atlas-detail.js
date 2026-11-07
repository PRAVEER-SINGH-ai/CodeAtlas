require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME || "codeatlas",
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 5000
    });

    console.log("PASS: MongoDB connected!");
    console.log("Database:", mongoose.connection.name);
    await mongoose.disconnect();
    return;
  } catch (e) {
    console.log("\n===== DETAILED MONGODB ERROR =====");
    console.log("Error:", e.name);
    console.log("Message:", e.message);

    const servers = e.reason?.servers;
    if (servers) {
      for (const [address, description] of servers) {
        console.log("\nServer:", address);
        console.log("Type:", description.type);
        if (description.error) {
          console.log("Underlying error:", description.error.name);
          console.log("Error code:", description.error.code || "Not provided");
          console.log("Error message:", description.error.message);
        }
      }
    }

    if (e.cause) {
      console.log("\nCause:", e.cause.name, e.cause.code || "");
      console.log("Cause message:", e.cause.message);
    }
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

main();
