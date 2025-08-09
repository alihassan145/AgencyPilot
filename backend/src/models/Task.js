const mongoose = require("mongoose");

const TASK_STATUS = ["todo", "in_progress", "done"];
const TASK_PRIORITY = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    dueDate: { type: Date },
    priority: { type: String, enum: TASK_PRIORITY, default: "medium" },
    status: { type: String, enum: TASK_STATUS, default: "todo" },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task, TASK_STATUS, TASK_PRIORITY };
