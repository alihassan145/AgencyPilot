const { Notification } = require("../models/Notification");
const { asyncHandler } = require("../utils/asyncHandler");

const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(items);
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { $set: { read: true } }
  );
  res.json({ message: "Marked all as read" });
});

module.exports = { listNotifications, markRead };
