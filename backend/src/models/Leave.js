const mongoose = require("mongoose");

const LEAVE_STATUS = ["pending", "approved", "rejected"];

const leaveSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: LEAVE_STATUS, default: "pending" },
    decisionBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decisionReason: { type: String },
  },
  { timestamps: true }
);

const Leave = mongoose.model("Leave", leaveSchema);

module.exports = { Leave, LEAVE_STATUS };
