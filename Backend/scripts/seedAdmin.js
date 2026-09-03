require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const { MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI || !ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error("Set MONGO_URI, ADMIN_USERNAME and ADMIN_PASSWORD before seeding.");
  }

  await mongoose.connect(MONGO_URI);
  const password = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.findOneAndUpdate(
    { username: ADMIN_USERNAME },
    { username: ADMIN_USERNAME, password, role: "admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin "${ADMIN_USERNAME}" is ready.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
