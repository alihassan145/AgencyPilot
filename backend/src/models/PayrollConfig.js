const mongoose = require("mongoose");

const payrollConfigSchema = new mongoose.Schema(
  {
    graceMinutes: { type: Number, default: 15 },
    // Late penalty configuration
    latePenalty: { type: Number, default: 0 },
    latePenaltyUnit: {
      type: String,
      enum: ["per_minute", "per_hour", "per_day"],
      default: "per_day",
    },
    // Overtime configuration
    overtimeEnabled: { type: Boolean, default: false },
    // Keep backward compatibility with existing field, but introduce new generic amount + unit
    overtimeBonusPerHour: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    overtimeUnit: {
      type: String,
      enum: ["per_minute", "per_hour", "per_day"],
      default: "per_hour",
    },
    // Office timings
    officialStart: { type: String, default: "10:00" },
    officialEnd: { type: String, default: "19:00" },
    // Default salary baseline
    defaultBaseSalary: { type: Number, default: 0 },
    // Professional tax
    professionalTaxThreshold: { type: Number, default: 12000 },
    professionalTaxAmount: { type: Number, default: 200 },
  },
  { timestamps: true }
);

const PayrollConfig = mongoose.model("PayrollConfig", payrollConfigSchema);

module.exports = { PayrollConfig };
