require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ name: "meSSET API", status: "ok" });
});
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "messet-backend" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/scan", require("./routes/scan"));
app.use("/api/users", require("./routes/users"));

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`meSSET API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();

module.exports = app;
