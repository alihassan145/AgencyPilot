const mongoose = require("mongoose");

const REPORT_STATUS = ["pending", "approved", "rejected"];

const reportSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: REPORT_STATUS, default: "pending" },
    rejectionReason: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = { Report, REPORT_STATUS };
