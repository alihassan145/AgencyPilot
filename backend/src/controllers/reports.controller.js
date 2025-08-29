const { Report } = require("../models/Report");
const { asyncHandler } = require("../utils/asyncHandler");

const submitReport = asyncHandler(async (req, res) => {
  const { title, content, client } = req.body;
  const report = await Report.create({
    author: req.user.id,
    manager: req.body.manager,
    title,
    content,
    client,
  });
  res.status(201).json(report);
});

const listReports = asyncHandler(async (req, res) => {
  const { client, employee, from, to, status } = req.query;
  const filter = {};
  if (client) filter.client = client;
  if (employee) filter.author = employee;
  if (status) filter.status = status;
  if (from || to)
    filter.date = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };

  if (req.user.role === "employee") filter.author = req.user.id;
  if (req.user.role === "manager")
    filter.$or = [{ manager: req.user.id }, { author: req.user.id }];

  const reports = await Report.find(filter).populate("author manager client");
  res.json(reports);
});

const approveReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  // Access control: only assigned manager or admin can approve
  if (req.user.role === "employee")
    return res.status(403).json({ message: "Forbidden" });
  if (req.user.role === "manager" && report.manager?.toString() !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  report.status = "approved";
  report.rejectionReason = undefined;
  await report.save();
  res.json(report);
});

const rejectReport = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  // Access control: only assigned manager or admin can reject
  if (req.user.role === "employee")
    return res.status(403).json({ message: "Forbidden" });
  if (req.user.role === "manager" && report.manager?.toString() !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  report.status = "rejected";
  report.rejectionReason = reason || "No reason provided";
  await report.save();
  res.json(report);
});

module.exports = { submitReport, listReports, approveReport, rejectReport };
