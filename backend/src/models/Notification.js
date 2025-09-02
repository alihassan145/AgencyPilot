const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // The primary user this notification belongs to (recipient)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Creator of the notification (useful for manager/team scope)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Explicit assignee (often same as user). Helps with generic team scoping.
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: { type: String, default: 'general', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },

    // Frontend uses priority; persist it here
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };
