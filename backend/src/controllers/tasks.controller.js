const { Task } = require("../models/Task");
const { Client } = require("../models/Client");
const { asyncHandler } = require("../utils/asyncHandler");
const { sendTaskCompletedNotification } = require("../services/whatsapp");

const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

const listTasks = asyncHandler(async (req, res) => {
  const { client, employee, status, from, to } = req.query;
  const filter = {};
  if (client) filter.client = client;
  if (employee) filter.assignedTo = employee;
  if (status) filter.status = status;
  if (from || to)
    filter.dueDate = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };

  // Scope by role
  if (req.user.role === "employee") {
    filter.assignedTo = req.user.id;
  } else if (req.user.role === "manager") {
    filter.reportingManager = req.user.id;
  } else if (req.user.role === "client") {
    filter.client = req.user.clientId || null;
  }

  const tasks = await Task.find(filter).populate(
    "assignedTo reportingManager client"
  );
  res.json(tasks);
});

const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(
    "assignedTo reportingManager client"
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const payload = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found" });

  // Employees can only update their own task status
  if (req.user.role === "employee") {
    if (task.assignedTo.toString() !== req.user.id)
      return res.status(403).json({ message: "Forbidden" });
    const allowed = ["status"];
    const pl = Object.keys(payload).reduce(
      (acc, key) =>
        allowed.includes(key) ? { ...acc, [key]: payload[key] } : acc,
      {}
    );
    if (pl.status === "done" && task.status !== "done")
      pl.completedAt = new Date();
    const updated = await Task.findByIdAndUpdate(task._id, pl, { new: true });
    return res.json(updated);
  }

  // Manager/Admin can update all fields
  const statusChangedToDone =
    payload.status === "done" && task.status !== "done";
  if (statusChangedToDone) payload.completedAt = new Date();
  const updated = await Task.findByIdAndUpdate(task._id, payload, {
    new: true,
  }).populate("assignedTo client");

  if (statusChangedToDone) {
    const client = updated.client
      ? await Client.findById(updated.client)
      : null;
    await sendTaskCompletedNotification({ task: updated, client });
  }
  res.json(updated);
});

const deleteTask = asyncHandler(async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask };
