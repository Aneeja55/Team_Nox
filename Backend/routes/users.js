const express = require("express");

const userController = require("../controllers/userController");

const {
  authenticate,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireAdmin,
  userController.register
);

router.get(
  "/me",
  authenticate,
  userController.profile
);

router.get(
  "/scanned-users",
  authenticate,
  requireAdmin,
  userController.getScannedUsers
);

router.get(
  "/",
  authenticate,
  requireAdmin,
  userController.users
);


/*
 * Student can access their own days eaten.
 */
router.get(
  "/days-eaten",
  authenticate,
  userController.getDaysEaten
);

router.delete(
  "/:userId",
  authenticate,
  requireAdmin,
  userController.deleteUser
);

router.put(
  "/:userId",
  authenticate,
  requireAdmin,
  userController.updateUser
);


module.exports = router;