require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const assert = require("assert");

const User = require("../src/models/User");
const PlatformAccount = require("../src/models/PlatformAccount");
const RatingHistory = require("../src/models/RatingHistory");
const StatsSnapshot = require("../src/models/StatsSnapshot");
const Contest = require("../src/models/Contest");
const ContestParticipation = require("../src/models/ContestParticipation");
const Notification = require("../src/models/Notification");

const created = [];

function track(model, doc) {
  created.push({ model, id: doc._id });
  return doc;
}

function enumValue(model, field, fallback) {
  const values = model.schema.path(field)?.enumValues || [];
  return values.length ? values[0] : fallback;
}

async function expectDuplicate(label, data) {
  try {
    const doc = await User.create(data);
    track(User, doc);
    throw new Error(`${label}: duplicate was incorrectly accepted.`);
  } catch (error) {
    if (error.message.includes("duplicate was incorrectly accepted")) {
      throw error;
    }
    if (error.code !== 11000) {
      throw new Error(`${label}: expected duplicate-key error, received: ${error.message}`);
    }
    console.log(`PASS: ${label}`);
  }
}

async function cleanup() {
  console.log("\nCleaning temporary records...");
  for (const item of [...created].reverse()) {
    await item.model.deleteOne({ _id: item.id }).catch(() => {});
  }
  console.log("PASS: Temporary record cleanup completed.");
}

async function main() {
  const dbName = process.env.MONGODB_DB_NAME || "codeatlas";
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing.");
  if (dbName !== "codeatlas") throw new Error("Wrong target database.");

  console.log("\n===== CODEATLAS DATABASE CRUD TEST =====");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName,
    serverSelectionTimeoutMS: 10000
  });

  assert.strictEqual(mongoose.connection.name, "codeatlas");
  console.log("PASS: Connected to codeatlas");

  const stamp = `${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const email = `crud_${stamp}@example.com`;
  const username = `ca_${stamp}`.slice(0, 25);
  const password = crypto.scryptSync("temporary-test-password", "codeatlas-crud", 32).toString("hex");

  // USER: CREATE + READ + UPDATE
  const user = track(User, await User.create({
    name: "CodeAtlas CRUD Test",
    username,
    email,
    password
  }));
  console.log("PASS: User created");

  const readUser = await User.findById(user._id).select("+password");
  assert(readUser);
  assert.strictEqual(readUser.email, email);
  console.log("PASS: User read");

  readUser.name = "CodeAtlas CRUD Updated";
  await readUser.save();
  const updatedUser = await User.findById(user._id);
  assert.strictEqual(updatedUser.name, "CodeAtlas CRUD Updated");
  console.log("PASS: User updated");

  // UNIQUE EMAIL + USERNAME
  await expectDuplicate("Unique email constraint", {
    name: "Duplicate Email Test",
    username: `other_${stamp}`.slice(0, 25),
    email,
    password
  });

  await expectDuplicate("Unique username constraint", {
    name: "Duplicate Username Test",
    username,
    email: `other_${stamp}@example.com`,
    password
  });

  // PLATFORM ACCOUNT
  const platform = enumValue(PlatformAccount, "platform", "codeforces");
  const account = track(PlatformAccount, await PlatformAccount.create({
    user: user._id,
    platform,
    handle: `crud_${stamp}`,
    verificationStatus: "pending",
    isPrimary: false
  }));
  console.log("PASS: Platform account created");

  const readAccount = await PlatformAccount.findOne({
    _id: account._id,
    user: user._id
  });
  assert(readAccount);
  console.log("PASS: Platform account read");

  readAccount.handle = `updated_${stamp}`;
  await readAccount.save();
  assert.strictEqual(
    (await PlatformAccount.findById(account._id)).handle,
    `updated_${stamp}`
  );
  console.log("PASS: Platform account updated");

  // RATING HISTORY
  const rating = track(RatingHistory, await RatingHistory.create({
    account: account._id,
    user: user._id,
    platform,
    contestId: `crud_contest_${stamp}`,
    contestName: "CRUD Test Contest",
    rank: 10,
    oldRating: 1200,
    newRating: 1250,
    date: new Date()
  }));
  assert(await RatingHistory.findById(rating._id));
  console.log("PASS: Rating history created and read");

  rating.newRating = 1300;
  await rating.save();
  assert.strictEqual(
    (await RatingHistory.findById(rating._id)).newRating,
    1300
  );
  console.log("PASS: Rating history updated");

  // STATS SNAPSHOT
  const snapshot = track(StatsSnapshot, await StatsSnapshot.create({
    account: account._id,
    user: user._id,
    rating: 1300,
    maxRating: 1300,
    problemsSolved: 100,
    contestsParticipated: 5,
    totalSubmissions: 150,
    acceptedSubmissions: 100,
    accuracy: 66.67,
    capturedAt: new Date()
  }));
  assert(await StatsSnapshot.findById(snapshot._id));
  console.log("PASS: Statistics snapshot created and read");

  snapshot.problemsSolved = 110;
  await snapshot.save();
  assert.strictEqual(
    (await StatsSnapshot.findById(snapshot._id)).problemsSolved,
    110
  );
  console.log("PASS: Statistics snapshot updated");

  // CONTEST
  const contest = track(Contest, await Contest.create({
    platform: enumValue(Contest, "platform", "codeforces"),
    contestId: `crud_${stamp}`,
    name: "CodeAtlas CRUD Test Contest",
    url: "https://example.com/crud-test",
    startTime: new Date(Date.now() + 86400000),
    durationSeconds: 7200,
    status: enumValue(Contest, "status", "upcoming")
  }));
  assert(await Contest.findById(contest._id));
  console.log("PASS: Contest created and read");

  contest.name = "Updated CRUD Test Contest";
  await contest.save();
  assert.strictEqual(
    (await Contest.findById(contest._id)).name,
    "Updated CRUD Test Contest"
  );
  console.log("PASS: Contest updated");

  // CONTEST PARTICIPATION
  const participation = track(ContestParticipation, await ContestParticipation.create({
    user: user._id,
    contest: contest._id,
    personalStatus: "planned",
    notes: "Temporary database test"
  }));
  assert(await ContestParticipation.findById(participation._id));
  console.log("PASS: Contest participation created and read");

  participation.personalStatus = "registered";
  await participation.save();
  assert.strictEqual(
    (await ContestParticipation.findById(participation._id)).personalStatus,
    "registered"
  );
  console.log("PASS: Contest participation updated");

  // NOTIFICATION
  const notification = track(Notification, await Notification.create({
    user: user._id,
    type: enumValue(Notification, "type", "system"),
    title: "CRUD Test Notification",
    message: "Temporary test notification"
  }));
  assert(await Notification.findById(notification._id));
  console.log("PASS: Notification created and read");

  notification.readAt = new Date();
  await notification.save();
  assert((await Notification.findById(notification._id)).readAt);
  console.log("PASS: Notification updated");

  // DELETE TEST
  const deleteResult = await Notification.deleteOne({ _id: notification._id });
  assert.strictEqual(deleteResult.deletedCount, 1);
  created.splice(created.findIndex(x => String(x.id) === String(notification._id)), 1);
  assert.strictEqual(await Notification.findById(notification._id), null);
  console.log("PASS: Individual record deletion");

  console.log("\nALL DATABASE CRUD TESTS PASSED!");
}

main()
  .catch(error => {
    console.error("\nCRUD TEST FAILED:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanup();
    } catch (error) {
      console.error("CLEANUP WARNING:", error.message);
      process.exitCode = 1;
    }
    await mongoose.disconnect().catch(() => {});
    console.log("Database connection closed.");
  });
