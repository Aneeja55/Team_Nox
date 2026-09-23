const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function makeToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    role: user.role,
  };
}

async function login(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({
  username,
  role: "user",
});
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    return res.json({
      message: "Login successful",
      token: makeToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Unable to log in" });
  }
}

async function adminLogin(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username, role: "admin" });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    return res.json({
      message: "Admin login successful",
      token: makeToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Unable to log in" });
  }
}

function protectedUser(req, res) {
  res.json({ success: true, userId: req.userId, role: req.user.role });
}

module.exports = { login, adminLogin, protectedUser };
