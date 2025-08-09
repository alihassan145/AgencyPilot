const { Leave } = require("../models/Leave");
const { asyncHandler } = require("../utils/asyncHandler");

const applyLeave = asyncHandler(async (req, res) => {
  const leave = await Leave.create({ ...req.body, user: req.user.id });
  res.status(201).json(leave);
});

const listLeaves = asyncHandler(async (req, res) => {
  const { employee, from, to, status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (from || to)
    filter.from = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  if (req.user.role === "employee") filter.user = req.user.id;
  if (req.user.role === "manager") filter.user = employee || req.user.id;
  if (req.user.role === "admin" && employee) filter.user = employee;
  const items = await Leave.find(filter).populate("user decisionBy");
  res.json(items);
});

const decideLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // action: approve|reject
  const leave = await Leave.findById(id);
  if (!leave) return res.status(404).json({ message: "Leave not found" });
  leave.status = action === "approve" ? "approved" : "rejected";
  leave.decisionBy = req.user.id;
  leave.decisionReason = reason || "";
  await leave.save();
  res.json(leave);
});

module.exports = { applyLeave, listLeaves, decideLeave };
