const { Lead } = require("../models/Lead");
const { asyncHandler } = require("../utils/asyncHandler");

// Create a new lead
const createLead = asyncHandler(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user.id };

  // Employees can only create leads assigned to themselves
  if (req.user.role === "employee") {
    payload.assignedTo = req.user.id;
  }

  const lead = await Lead.create(payload);
  res.status(201).json(lead);
});

// List leads – scope to assignee for employees, or all for manager/admin
const listLeads = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === "employee") {
    filter.assignedTo = req.user.id;
  }
  const leads = await Lead.find(filter).populate("assignedTo createdBy");
  res.json(leads);
});

// Get single lead by id
const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate("assignedTo createdBy");
  if (!lead) return res.status(404).json({ message: "Lead not found" });
  res.json(lead);
});

// Update lead
const updateLead = asyncHandler(async (req, res) => {
  const existing = await Lead.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: "Lead not found" });

  // Employees can only update their own leads
  if (req.user.role === "employee" && existing.assignedTo.toString() !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });

  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(lead);
});

// Delete lead
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found" });

  // Only admin or manager can delete leads
  if (!["admin", "manager"].includes(req.user.role))
    return res.status(403).json({ message: "Forbidden" });

  await Lead.findByIdAndDelete(req.params.id);
  res.json({ message: "Lead deleted" });
});

module.exports = { createLead, listLeads, getLead, updateLead, deleteLead };