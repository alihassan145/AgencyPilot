const mongoose = require("mongoose");

const LEAD_STATUS = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    source: { type: String, trim: true },
    status: { type: String, enum: LEAD_STATUS, default: "new" },
    notes: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = { Lead, LEAD_STATUS };