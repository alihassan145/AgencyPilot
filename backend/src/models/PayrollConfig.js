const mongoose = require("mongoose");

const payrollConfigSchema = new mongoose.Schema(
  {
    graceMinutes: { type: Number, default: 15 },
    latePenalty: { type: Number, default: 0 },
    overtimeEnabled: { type: Boolean, default: false },
    overtimeBonusPerHour: { type: Number, default: 0 },
    officialStart: { type: String, default: "10:00" },
    officialEnd: { type: String, default: "19:00" },
    defaultBaseSalary: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const PayrollConfig = mongoose.model("PayrollConfig", payrollConfigSchema);

module.exports = { PayrollConfig };
