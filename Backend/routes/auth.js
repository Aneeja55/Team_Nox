const express = require("express");
const { login, adminLogin, protectedUser } = require("../controllers/authController");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/admin/login", adminLogin);
router.get("/user/protected", authenticate, protectedUser);
router.get("/admin/protected", authenticate, requireAdmin, protectedUser);

module.exports = router;
