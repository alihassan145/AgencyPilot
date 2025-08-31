const dayjs = require("dayjs");
const { PayrollConfig } = require("../models/PayrollConfig");
const { Attendance } = require("../models/Attendance");
const { asyncHandler } = require("../utils/asyncHandler");

function parseTimeToDate(base, hhmm) {
  const [h, m] = (hhmm || "00:00").split(":").map(Number);
  return dayjs(base).hour(h).minute(m).second(0).millisecond(0).toDate();
}

function dailyOfficialHours(config, sampleDate) {
  const start = parseTimeToDate(sampleDate, config.officialStart || "10:00");
  const end = parseTimeToDate(sampleDate, config.officialEnd || "19:00");
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, Number(hours.toFixed(2)));
}

function calcByUnit(amount, unit, { minutes = 0, hours = 0, days = 0 }) {
  switch (unit) {
    case "per_minute":
      return amount * minutes;
    case "per_hour":
      return amount * hours;
    case "per_day":
    default:
      return amount * days;
  }
}

const setConfig = asyncHandler(async (req, res) => {
  const existing = await PayrollConfig.findOne();
  if (existing) {
    Object.assign(existing, req.body);
    await existing.save();
    return res.json(existing);
  }
  const config = await PayrollConfig.create(req.body);
  res.status(201).json(config);
});

const getConfig = asyncHandler(async (req, res) => {
  const config = await PayrollConfig.findOne();
  res.json(config || {});
});

const myEarnings = asyncHandler(async (req, res) => {
  const config = (await PayrollConfig.findOne()) || {
    graceMinutes: 15,
    latePenalty: 0,
    latePenaltyUnit: "per_day",
    overtimeEnabled: false,
    overtimeAmount: 0,
    overtimeUnit: "per_hour",
    professionalTaxThreshold: 12000,
    professionalTaxAmount: 200,
    officialStart: "10:00",
    officialEnd: "19:00",
  };
  const month = req.query.month || dayjs().format("YYYY-MM");
  const start = dayjs(month + "-01");
  const end = start.endOf("month");

  const workingDaysParam = Number(req.query.workingDays || 0);
  const totalDaysInMonth = end.date();
  const workingDays = workingDaysParam > 0 ? workingDaysParam : 26; // default to 26 as common practice/your UI example

  const records = await Attendance.find({
    user: req.user.id,
    date: { $gte: start.toDate(), $lte: end.toDate() },
  });

  // Late metrics
  const lateRecords = records.filter((r) => r.wasLate);
  const lateCount = lateRecords.length;
  const lateMinutes = records.reduce((sum, r) => sum + (r.lateMinutes || 0), 0);
  const lateHours = Number((lateMinutes / 60).toFixed(2));

  // Overtime
  const overtimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);

  // Compute daily official hours and expected monthly hours
  const dailyHours = dailyOfficialHours(config, start.toDate());
  const expectedMonthlyHours = dailyHours * workingDays;
  const workedHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);
  const prorationFactor = expectedMonthlyHours > 0 ? Math.min(1, workedHours / expectedMonthlyHours) : 0;

  // Base salary and proration
  const baseSalary = Number(req.query.baseSalary || config.defaultBaseSalary || 0);
  const proratedBase = Number((baseSalary * prorationFactor).toFixed(2));

  // Late deduction based on configured unit
  const lateDeduction = calcByUnit(config.latePenalty || 0, config.latePenaltyUnit || "per_day", {
    minutes: lateMinutes,
    hours: lateHours,
    days: lateCount,
  });

  // Unapproved absence double-deduction: param unapprovedAbsentDays
  const unapprovedAbsentDays = Number(req.query.unapprovedAbsentDays || 0);
  const perDayRate = workingDays > 0 ? baseSalary / workingDays : 0;
  const doubleDeduction = unapprovedAbsentDays * 2 * perDayRate;

  // Overtime bonus if enabled
  let bonus = 0;
  if (config.overtimeEnabled) {
    const amount = (config.overtimeAmount && config.overtimeAmount > 0)
      ? config.overtimeAmount
      : (config.overtimeBonusPerHour || 0);
    const unit = (config.overtimeAmount && config.overtimeAmount > 0)
      ? (config.overtimeUnit || "per_hour")
      : "per_hour";
    bonus = calcByUnit(amount, unit, {
      minutes: overtimeHours * 60,
      hours: overtimeHours,
      days: dailyHours > 0 ? (overtimeHours / dailyHours) : 0, // approximate days
    });
  }

  // Professional tax threshold applied on prorated base
  const professionalTax = proratedBase > (config.professionalTaxThreshold || 12000)
    ? (config.professionalTaxAmount || 200)
    : 0;

  const deductions = Math.max(0, lateDeduction + doubleDeduction + professionalTax);
  const totalEarnings = Math.max(0, Number((proratedBase - deductions + bonus).toFixed(2)));

  res.json({
    month,
    baseSalary,
    workingDays,
    dailyOfficialHours: dailyHours,
    expectedMonthlyHours: Number(expectedMonthlyHours.toFixed(2)),
    workedHours: Number(workedHours.toFixed(2)),
    prorationFactor: Number(prorationFactor.toFixed(4)),
    proratedBase,
    perDayRate: Number(perDayRate.toFixed(2)),
    lateDeduction: Number(lateDeduction.toFixed(2)),
    professionalTax: Number(professionalTax.toFixed(2)),
    unapprovedAbsentDays,
    doubleDeduction: Number(doubleDeduction.toFixed(2)),
    deductions: Number(deductions.toFixed(2)),
    overtimeHours: Number(overtimeHours.toFixed(2)),
    bonus: Number(bonus.toFixed(2)),
    totalEarnings,
  });
});

module.exports = { setConfig, getConfig, myEarnings };
