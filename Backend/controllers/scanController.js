const moment = require("moment-timezone");
const Scan = require("../models/Scan");
const User = require("../models/User");
const QRCode = require("qrcode");

const TIMEZONE = process.env.TIMEZONE || "Asia/Kolkata";

const WINDOWS = {
  lunch: { start: "11:00", end: "14:00", label: "11:00 AM – 2:00 PM" },
  snack: { start: "15:30", end: "17:00", label: "3:30 PM – 5:00 PM" },
};

function nowLocal() {
  return moment.tz(TIMEZONE);
}

function getWindow(type, day = nowLocal()) {
  const window = WINDOWS[type];
  if (!window) return null;

  const [startHour, startMinute] = window.start.split(":").map(Number);
  const [endHour, endMinute] = window.end.split(":").map(Number);

  return {
    ...window,
    start: day.clone().startOf("day").hour(startHour).minute(startMinute),
    end: day.clone().startOf("day").hour(endHour).minute(endMinute),
  };
}

function dayBounds(day = nowLocal()) {
  const start = day.clone().startOf("day");
  return {
    start: start.toDate(),
    end: start.clone().add(1, "day").toDate(),
    scanDay: start.format("YYYY-MM-DD"),
  };
}

function formatWindow(type) {
  return WINDOWS[type]?.label || "";
}

async function availability(req, res) {
  const type = String(req.query.type || "").toLowerCase();
  if (!WINDOWS[type]) {
    return res.status(400).json({ error: "Invalid scan type" });
  }

  try {
    const now = nowLocal();
    const window = getWindow(type, now);
    const { start, end, scanDay } = dayBounds(now);
    const existingScan = await Scan.findOne({
      userId: req.userId,
      type,
      status: "success",
      $or: [
        { scanDay },
        { scanDay: { $exists: false }, date: { $gte: start, $lt: end } },
      ],
    }).lean();

    const withinWindow = now.isBetween(window.start, window.end, undefined, "[]");

    return res.json({
      type,
      isAvailable: withinWindow && !existingScan,
      withinWindow,
      alreadyScanned: Boolean(existingScan),
      start: window.start.format("HH:mm"),
      end: window.end.format("HH:mm"),
      label: formatWindow(type),
      serverTime: now.toISOString(),
      timezone: TIMEZONE,
    });
  } catch (error) {
    console.error("Availability error:", error);
    return res.status(500).json({ error: "Unable to check scan availability" });
  }
}

async function scan(req, res) {
  const type = String(req.body.type || "").toLowerCase();
  const code = String(req.body.code || "").trim();

  if (!WINDOWS[type]) {
    return res.status(400).json({ error: "Invalid scan type" });
  }

  if (!process.env.QR_CODE) {
    return res.status(500).json({ error: "QR_CODE is not configured" });
  }

  if (!code || code !== process.env.QR_CODE) {
    return res.status(400).json({ error: "Invalid QR code" });
  }

  const now = nowLocal();
  const window = getWindow(type, now);

  if (!now.isBetween(window.start, window.end, undefined, "[]")) {
    return res.status(400).json({
      error: `${type === "lunch" ? "Lunch" : "Snack"} scanning is only allowed between ${window.label}`,
    });
  }

  const { start, end, scanDay } = dayBounds(now);

  try {
    // This also handles older records that do not have scanDay.
    const existingScan = await Scan.findOne({
      userId: req.userId,
      type,
      status: "success",
      $or: [
        { scanDay },
        { scanDay: { $exists: false }, date: { $gte: start, $lt: end } },
      ],
    });

    if (existingScan) {
      // Keep the failed attempt for the calendar/audit trail.
      await Scan.create({
        userId: req.userId,
        type,
        date: now.toDate(),
        scanDay,
        status: "duplicate",
      }).catch(() => {});

      return res.status(409).json({
        error: `Already scanned ${type} today`,
        duplicate: true,
      });
    }

    try {
      await Scan.create({
        userId: req.userId,
        type,
        date: now.toDate(),
        scanDay,
      });
    } catch (error) {
      // Unique index protects against two nearly simultaneous scan requests.
      if (error?.code === 11000) {
        await Scan.create({
          userId: req.userId,
          type,
          date: now.toDate(),
          scanDay,
          status: "duplicate",
        }).catch(() => {});

        return res.status(409).json({
          error: `Already scanned ${type} today`,
          duplicate: true,
        });
      }
      throw error;
    }

    return res.status(201).json({
      message: `${type === "lunch" ? "Lunch" : "Snack"} scan successful`,
      type,
      date: now.format("YYYY-MM-DD"),
      time: now.format("hh:mm A"),
    });
  } catch (error) {
    console.error("Scan error:", error);
    return res.status(500).json({ error: "Error processing scan" });
  }
}

async function history(req, res) {
  try {
    const scans = await Scan.find({ userId: req.userId })
      .sort({ date: -1 })
      .select("type date scanDay status")
      .lean();

    return res.json(
      scans.map((scan) => ({
        id: scan._id,
        type: scan.type,
        status: scan.status || "success",
        date: scan.date,
        scanDay: scan.scanDay || moment(scan.date).tz(TIMEZONE).format("YYYY-MM-DD"),
      }))
    );
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({ error: "Unable to fetch meal history" });
  }
}

async function adminDashboard(req, res) {
  try {
    const now = nowLocal();
    const { start, end, scanDay } = dayBounds(now);

    const [totalUsers, lunchScans, snackScans] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Scan.find({ type: "lunch", status: "success", $or: [
        { scanDay },
        { scanDay: { $exists: false }, date: { $gte: start, $lt: end } },
      ] }).populate("userId", "username").sort({ date: 1 }).lean(),
      Scan.find({ type: "snack", status: "success", $or: [
        { scanDay },
        { scanDay: { $exists: false }, date: { $gte: start, $lt: end } },
      ] }).populate("userId", "username").sort({ date: 1 }).lean(),
    ]);

    const mapScan = (scan) => ({
      id: scan._id,
      username: scan.userId?.username || "Deleted user",
      time: moment(scan.date).tz(TIMEZONE).format("hh:mm A"),
      date: moment(scan.date).tz(TIMEZONE).format("YYYY-MM-DD"),
    });

    return res.json({
      date: scanDay,
      timezone: TIMEZONE,
      totalUsers,
      totalLunchScans: lunchScans.length,
      lunchUsers: lunchScans.map(mapScan),
      totalSnackScans: snackScans.length,
      snackUsers: snackScans.map(mapScan),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return res.status(500).json({ error: "Error fetching dashboard data" });
  }
}

async function adminQr(req, res) {
  if (!process.env.QR_CODE) {
    return res.status(500).json({ error: "QR_CODE is not configured" });
  }

  try {
    const dataUrl = await QRCode.toDataURL(process.env.QR_CODE, {
      errorCorrectionLevel: "H",
      width: 420,
      margin: 2,
    });
    return res.json({
      dataUrl,
      value: process.env.QR_CODE,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return res.status(500).json({ error: "Unable to generate QR code" });
  }
}

module.exports = { scan, availability, history, adminDashboard, adminQr };
