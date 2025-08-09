const mongoose = require("mongoose");

const payrollRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: String, required: true }, // e.g. 2025-08
    baseSalary: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

payrollRecordSchema.index({ user: 1, month: 1 }, { unique: true });

const PayrollRecord = mongoose.model("PayrollRecord", payrollRecordSchema);

module.exports = { PayrollRecord };
