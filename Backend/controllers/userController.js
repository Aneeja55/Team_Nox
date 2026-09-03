const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Scan = require("../models/Scan");
const moment = require("moment-timezone");
const User = require("../models/User");

function tokenFor(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function safeUser(user) {
  return { id: user._id, username: user.username, role: user.role };
}

async function register(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || password.length < 4) {
    return res.status(400).json({
      error: "Username is required and password must be at least 4 characters",
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 12),
      role: "user",
    });

    return res.status(201).json({
      message: "User created successfully",
      token: tokenFor(user),
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Error creating user" });
  }
}

async function profile(req, res) {
  try {
    const user = await User.findById(req.userId).select("_id username role createdAt");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(safeUser(user));
  } catch (error) {
    return res.status(500).json({ error: "Unable to fetch profile" });
  }
}

async function users(req, res) {
  try {
    const users = await User.find({ role: "user" })
      .select("_id username role createdAt")
      .sort({ username: 1 })
      .lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching users" });
  }
}

async function updateUser(req, res) {
  const { userId } = req.params;
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username) return res.status(400).json({ error: "Username is required" });

  try {
    const update = { username };
    if (password) {
      if (password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters" });
      }
      update.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: "user" },
      update,
      { new: true, runValidators: true }
    ).select("_id username role createdAt");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    return res.json(updatedUser);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Username already exists" });
    }
    return res.status(500).json({ error: "Error updating user" });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.userId, role: "user" });
    if (!user) return res.status(404).json({ error: "User not found" });

    await Scan.deleteMany({ userId: user._id });
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Error deleting user" });
  }
}

async function getScannedUsers(req, res) {
  try {
    const timezone = process.env.TIMEZONE || "Asia/Kolkata";
    const start = moment.tz(timezone).startOf("day");
    const end = start.clone().add(1, "day");
    const scans = await Scan.find({
      status: "success",
      date: { $gte: start.toDate(), $lt: end.toDate() },
    }).select("userId type date").lean();

    return res.json(scans);
  } catch (error) {
    return res.status(500).json({ error: "Error fetching scanned users" });
  }
}

module.exports = {
  register,
  profile,
  users,
  updateUser,
  deleteUser,
  getScannedUsers,
};
