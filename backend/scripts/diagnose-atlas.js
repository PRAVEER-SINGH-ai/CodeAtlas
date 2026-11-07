require("dotenv").config();
const dns = require("dns").promises;
const mongoose = require("mongoose");

function reportError(label, e) {
  console.log(`FAIL: ${label}`);
  console.log("Error name:", e.name || "Unknown");
  console.log("Error code:", e.code || e.codeName || "Not provided");
  console.log("Message:", String(e.message || e).slice(0, 700));
}

async function main() {
  const uri = process.env.MONGODB_URI || "";
  const dbName = process.env.MONGODB_DB_NAME || "codeatlas";

  console.log("\n===== CODEATLAS ATLAS DIAGNOSTICS =====");

  if (!uri) {
    console.log("FAIL: MONGODB_URI is missing.");
    return;
  }

  if (uri.includes("<") || uri.includes(">") ||
      uri.includes("YOUR_PASSWORD") || uri.includes("YOUR_CLUSTER")) {
    console.log("FAIL: Connection string still contains placeholders.");
    return;
  }

  if (!uri.startsWith("mongodb+srv://")) {
    console.log("FAIL: Expected a mongodb+srv:// connection string.");
    return;
  }

  const match = uri.match(/^mongodb\+srv:\/\/(?:[^@/]+@)?([^/?]+)/i);
  if (!match) {
    console.log("FAIL: Could not parse cluster hostname. Check URI format.");
    return;
  }

  const host = match[1];
  console.log("PASS: URI exists and has no obvious placeholders.");
  console.log("Cluster hostname:", host);
  console.log("Target database:", dbName);

  console.log("\n[1] DNS hostname lookup");
  try {
    const addresses = await dns.lookup(host, { all: true });
    console.log("PASS: Hostname resolves.");
    console.log("Resolved address count:", addresses.length);
  } catch (e) {
    reportError("DNS hostname lookup", e);
  }

  console.log("\n[2] MongoDB SRV lookup");
  try {
    const records = await dns.resolveSrv(`_mongodb._tcp.${host}`);
    console.log("PASS: SRV lookup successful.");
    console.log("Atlas endpoints found:", records.length);
    records.forEach((r, i) => {
      console.log(`Endpoint ${i + 1}: ${r.name}:${r.port}`);
    });
  } catch (e) {
    reportError("MongoDB SRV lookup", e);
    console.log("SRV lookup failure often indicates DNS/network restrictions or an incorrect cluster hostname.");
    return;
  }

  console.log("\n[3] Actual MongoDB connection");
  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    });

    console.log("PASS: MongoDB connection successful.");
    console.log("Connected database:", mongoose.connection.name);

    const result = await mongoose.connection.db.admin().ping();
    console.log("PASS: MongoDB ping:", result.ok);

  } catch (e) {
    reportError("MongoDB connection", e);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }

  console.log("\n===== DIAGNOSTICS FINISHED =====");
}

main().catch(e => reportError("Diagnostic script", e));
