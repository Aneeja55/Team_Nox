const express = require("express");
const { scan, availability, history, adminDashboard, adminQr } = require("../controllers/scanController");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/availability", authenticate, availability);
router.post("/", authenticate, scan);
router.get("/history", authenticate, history);
router.get("/admin/dashboard", authenticate, requireAdmin, adminDashboard);
router.get("/admin/qr", authenticate, requireAdmin, adminQr);

module.exports = router;
