const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Scan = require("../models/Scan");
const moment = require("moment-timezone");
const User = require("../models/User");

function tokenFor(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );
}

function safeUser(user) {
  return {
    id: user._id,
    username: user.username,
    role: user.role,
  };
}

async function register(req, res) {
  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username || password.length < 4) {
    return res.status(400).json({
      error:
        "Username is required and password must be at least 4 characters",
    });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists",
      });
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

    return res.status(500).json({
      error: "Error creating user",
    });
  }
}

async function profile(req, res) {
  try {
    const user = await User.findById(req.userId).select(
      "_id username role createdAt"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json(safeUser(user));
  } catch (error) {
    return res.status(500).json({
      error: "Unable to fetch profile",
    });
  }
}

/*
 * Get all students.
 *
 * Current month:
 * Shows the number of unique days eaten
 * during the current month.
 *
 * Previous month:
 * Shown only during days 1-5 of the current month.
 *
 * Lunch + snack on the same date = 1 day.
 */
async function users(req, res) {
  try {
    const timezone =
      process.env.TIMEZONE || "Asia/Kolkata";

    const now = moment.tz(timezone);

    /*
     * Current month
     */
    const currentMonthStart = now
      .clone()
      .startOf("month");

    const nextMonthStart = currentMonthStart
      .clone()
      .add(1, "month");

    /*
     * Previous month
     */
    const previousMonthStart = currentMonthStart
      .clone()
      .subtract(1, "month");

    /*
     * Get all student accounts.
     */
    const users = await User.find({
      role: "user",
    })
      .select("_id username role createdAt")
      .sort({ username: 1 })
      .lean();

    const userIds = users.map(
      (user) => user._id
    );

    /*
     * Show previous month only on days 1-5.
     */
    const showPreviousMonth = now.date() <= 5;

    /*
     * If there are no students, return immediately.
     */
    if (userIds.length === 0) {
      return res.json({
        success: true,

        currentMonth: {
          key: currentMonthStart.format("YYYY-MM"),
          label: currentMonthStart.format("MMMM YYYY"),
        },

        showPreviousMonth,

        previousMonth: showPreviousMonth
          ? {
              key: previousMonthStart.format("YYYY-MM"),
              label: previousMonthStart.format("MMMM YYYY"),
            }
          : null,

        users: [],
      });
    }

    /*
     * Get successful scans from the previous month
     * through the end of the current month.
     */
    const dayCounts = await Scan.aggregate([
      {
        $match: {
          userId: {
            $in: userIds,
          },

          status: "success",

          date: {
            $gte: previousMonthStart.toDate(),
            $lt: nextMonthStart.toDate(),
          },
        },
      },

      /*
       * Make each scan into:
       *
       * student + calendar day
       *
       * Lunch + snack on the same date
       * therefore become one record.
       */
      {
        $group: {
          _id: {
            userId: "$userId",

            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$date",
                timezone: timezone,
              },
            },
          },
        },
      },

      /*
       * Extract YYYY-MM from the unique date.
       */
      {
        $project: {
          userId: "$_id.userId",

          month: {
            $substrBytes: [
              "$_id.day",
              0,
              7,
            ],
          },
        },
      },

      /*
       * Count unique eating days per student per month.
       */
      {
        $group: {
          _id: {
            userId: "$userId",
            month: "$month",
          },

          days: {
            $sum: 1,
          },
        },
      },
    ]);

    /*
     * Create an easy lookup map.
     *
     * Example:
     *
     * student01_2026-09 -> 12
     * student01_2026-08 -> 10
     */
    const countMap = new Map();

    for (const item of dayCounts) {
      const userId =
        item._id.userId.toString();

      const month =
        item._id.month;

      countMap.set(
        `${userId}_${month}`,
        item.days
      );
    }

    const currentMonthKey =
      currentMonthStart.format("YYYY-MM");

    const previousMonthKey =
      previousMonthStart.format("YYYY-MM");

    /*
     * Add month-specific counts to every student.
     */
    const result = users.map((user) => {
      const userId =
        user._id.toString();

      const currentMonthDays =
        countMap.get(
          `${userId}_${currentMonthKey}`
        ) || 0;

      const previousMonthDays =
        countMap.get(
          `${userId}_${previousMonthKey}`
        ) || 0;

      return {
        ...user,

        currentMonthDays,

        ...(showPreviousMonth
          ? {
              previousMonthDays,
            }
          : {}),
      };
    });

    return res.json({
      success: true,

      currentMonth: {
        key: currentMonthKey,
        label: currentMonthStart.format("MMMM YYYY"),
      },

      showPreviousMonth,

      previousMonth: showPreviousMonth
        ? {
            key: previousMonthKey,
            label: previousMonthStart.format("MMMM YYYY"),
          }
        : null,

      users: result,
    });
  } catch (error) {
    console.error(
      "Error fetching users:",
      error
    );

    return res.status(500).json({
      error: "Error fetching users",
    });
  }
}

async function updateUser(req, res) {
  const { userId } = req.params;

  const username = String(req.body.username || "").trim();
  const password = String(req.body.password || "");

  if (!username) {
    return res.status(400).json({
      error: "Username is required",
    });
  }

  try {
    const update = {
      username,
    };

    if (password) {
      if (password.length < 4) {
        return res.status(400).json({
          error: "Password must be at least 4 characters",
        });
      }

      update.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        role: "user",
      },
      update,
      {
        new: true,
        runValidators: true,
      }
    ).select("_id username role createdAt");

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json(updatedUser);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    return res.status(500).json({
      error: "Error updating user",
    });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.userId,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await Scan.deleteMany({
      userId: user._id,
    });

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error deleting user",
    });
  }
}

async function getScannedUsers(req, res) {
  try {
    const timezone =
      process.env.TIMEZONE || "Asia/Kolkata";

    const start = moment
      .tz(timezone)
      .startOf("day");

    const end = start.clone().add(1, "day");

    const scans = await Scan.find({
      status: "success",
      date: {
        $gte: start.toDate(),
        $lt: end.toDate(),
      },
    })
      .select("userId type date")
      .lean();

    return res.json(scans);
  } catch (error) {
    return res.status(500).json({
      error: "Error fetching scanned users",
    });
  }
}

/*
 * Student's total lifetime mess days.
 *
 * Lunch + snack on the same date = 1 day.
 */
async function getDaysEaten(req, res) {
  try {
    const userId = req.userId;

    const timezone =
      process.env.TIMEZONE || "Asia/Kolkata";

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Invalid user ID",
      });
    }

    const result = await Scan.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "success",
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
              timezone: timezone,
            },
          },
        },
      },

      {
        $count: "daysEaten",
      },
    ]);

    const daysEaten =
      result.length > 0
        ? result[0].daysEaten
        : 0;

    return res.json({
      success: true,
      daysEaten,
    });
  } catch (error) {
    console.error(
      "Days eaten error:",
      error
    );

    return res.status(500).json({
      error: "Unable to calculate days eaten",
    });
  }
}

module.exports = {
  register,
  profile,
  users,
  updateUser,
  deleteUser,
  getScannedUsers,
  getDaysEaten,
};