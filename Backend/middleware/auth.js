const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const token = req.header("x-access-token") || req.header("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT_SECRET is not configured" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
