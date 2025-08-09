const dayjs = require("dayjs");
const { PayrollConfig } = require("../models/PayrollConfig");
const { Attendance } = require("../models/Attendance");
const { asyncHandler } = require("../utils/asyncHandler");

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
    overtimeEnabled: false,
    overtimeBonusPerHour: 0,
  };
  const month = req.query.month || dayjs().format("YYYY-MM");
  const start = dayjs(month + "-01");
  const end = start.endOf("month");
  const records = await Attendance.find({
    user: req.user.id,
    date: { $gte: start.toDate(), $lte: end.toDate() },
  });

  const lateCount = records.filter((r) => r.wasLate).length;
  const overtimeHours = records.reduce(
    (sum, r) => sum + (r.overtimeHours || 0),
    0
  );
  const deductions = lateCount * (config.latePenalty || 0);
  const bonus = config.overtimeEnabled
    ? overtimeHours * (config.overtimeBonusPerHour || 0)
    : 0;

  const baseSalary = Number(
    req.query.baseSalary || config.defaultBaseSalary || 0
  );
  const totalEarnings = Math.max(0, baseSalary - deductions + bonus);

  res.json({
    month,
    baseSalary,
    deductions,
    overtimeHours: Number(overtimeHours.toFixed(2)),
    bonus,
    totalEarnings,
  });
});

module.exports = { setConfig, getConfig, myEarnings };
