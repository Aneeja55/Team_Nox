const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["lunch", "snack"],
      required: true,
      index: true,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    scanDay: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "duplicate"],
      default: "success",
      index: true,
    },
  },
  { timestamps: true }
);

// Only successful scans are unique. Duplicate attempts can be retained for the calendar/audit trail.
scanSchema.index(
  { userId: 1, type: 1, scanDay: 1 },
  { unique: true, partialFilterExpression: { status: "success" } }
);

module.exports = mongoose.model("Scan", scanSchema);
