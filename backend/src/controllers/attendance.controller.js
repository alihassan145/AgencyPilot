const dayjs = require("dayjs");
const { Attendance } = require("../models/Attendance");
const { PayrollConfig } = require("../models/PayrollConfig");
const { asyncHandler } = require("../utils/asyncHandler");

function getOfficialTimes(config, date) {
  const d = dayjs(date);
  const [sh, sm] = (config.officialStart || "10:00").split(":").map(Number);
  const [eh, em] = (config.officialEnd || "19:00").split(":").map(Number);
  const start = d.hour(sh).minute(sm).second(0).millisecond(0).toDate();
  const end = d.hour(eh).minute(em).second(0).millisecond(0).toDate();
  return { start, end };
}

const checkIn = asyncHandler(async (req, res) => {
  const now = new Date();
  const dateKey = dayjs(now).startOf("day").toDate();
  const config = (await PayrollConfig.findOne()) || {};
  const { start } = getOfficialTimes(config, now);
  const graceMs = (config.graceMinutes || 15) * 60 * 1000;
  const wasLate = now.getTime() > start.getTime() + graceMs;
  const lateMs = Math.max(0, now.getTime() - (start.getTime() + graceMs));
  const lateMinutes = Math.floor(lateMs / (1000 * 60));

  const attendance = await Attendance.findOneAndUpdate(
    { user: req.user.id, date: dateKey },
    { $setOnInsert: { checkIn: now, wasLate, lateMinutes } },
    { new: true, upsert: true }
  );
  res.json(attendance);
});

const checkOut = asyncHandler(async (req, res) => {
  const now = new Date();
  const dateKey = dayjs(now).startOf("day").toDate();
  const config = (await PayrollConfig.findOne()) || {};
  const { end } = getOfficialTimes(config, now);

  const attendance = await Attendance.findOne({
    user: req.user.id,
    date: dateKey,
  });
  if (!attendance || !attendance.checkIn)
    return res.status(400).json({ message: "Not checked in" });
  attendance.checkOut = now;
  const totalHours =
    (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
  attendance.totalHours = Math.max(0, Number(totalHours.toFixed(2)));
  attendance.leftEarly = now < end;
  attendance.overtimeHours = Math.max(
    0,
    Number(((now - end) / (1000 * 60 * 60)).toFixed(2))
  );
  await attendance.save();
  res.json(attendance);
});

const listAttendance = asyncHandler(async (req, res) => {
  const { employee, from, to } = req.query;
  const filter = {};
  if (from || to)
    filter.date = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };

  if (req.user.role === "employee") filter.user = req.user.id;
  if (req.user.role === "manager") filter.user = employee || req.user.id; // simplistic team filter
  if (req.user.role === "admin" && employee) filter.user = employee;

  const items = await Attendance.find(filter).populate("user");
  res.json(items);
});

module.exports = { checkIn, checkOut, listAttendance };
