const mongoose = require("mongoose");

const modelFiles = [
  "../models/User",
  "../models/PlatformAccount",
  "../models/RatingHistory",
  "../models/StatsSnapshot",
  "../models/Contest",
  "../models/ContestParticipation",
  "../models/Notification"
];

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || "codeatlas";
  const timeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || 10000);

  if (!uri || !uri.trim()) {
    throw new Error("MONGODB_URI is missing. Configure it in backend/.env.");
  }

  if (dbName !== "codeatlas") {
    throw new Error(`Expected MONGODB_DB_NAME=codeatlas, received '${dbName}'.`);
  }

  console.log("\n[DATABASE] Connecting to MongoDB Atlas...");

  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: timeout,
    autoIndex: false
  });

  if (mongoose.connection.name !== "codeatlas") {
    throw new Error(
      `Connected to unexpected database '${mongoose.connection.name}'. Expected 'codeatlas'.`
    );
  }

  console.log("[DATABASE] Connected successfully!");
  console.log(`[DATABASE] Active database: ${mongoose.connection.name}`);

  const ping = await mongoose.connection.db.admin().ping();
  if (ping.ok !== 1) {
    throw new Error("MongoDB ping verification failed.");
  }

  console.log("[DATABASE] MongoDB ping successful.");

  const models = modelFiles.map(file => require(file));

  console.log("[DATABASE] Verifying model indexes...");

  for (const model of models) {
    await model.createIndexes();
    const indexes = await model.collection.indexes();
    console.log(`[DATABASE] ${model.modelName}: ${indexes.length} indexes ready.`);
  }

  console.log(`[DATABASE] Model indexes verified: ${models.length}/${models.length}`);
  return true;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("[DATABASE] Disconnected.");
  }
}

module.exports = { connectDB, disconnectDB };
