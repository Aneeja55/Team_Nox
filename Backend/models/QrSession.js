const mongoose = require("mongoose");

const qrSessionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lunch", "snack"],
      required: true,
    },
    scanDay: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Only one QR session per meal per day.
qrSessionSchema.index(
  { type: 1, scanDay: 1 },
  { unique: true }
);

// Every generated QR token must be unique.
qrSessionSchema.index(
  { token: 1 },
  { unique: true }
);

module.exports = mongoose.model("QrSession", qrSessionSchema);