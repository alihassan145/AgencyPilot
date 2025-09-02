const { Notification } = require("../models/Notification");
const { asyncHandler } = require("../utils/asyncHandler");
const { buildScopeQuery, hasPermission } = require("../middleware/permissions");

const listNotifications = asyncHandler(async (req, res) => {
  // Build query based on user's role and permissions
  const query = await buildScopeQuery(req.user, 'notifications');
  
  const items = await Notification.find(query)
    .populate('user', 'name role')
    .sort({ createdAt: -1 });
  
  res.json(items);
});

const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, title, message, priority } = req.body;
  
  // Check if user can create notifications
  if (!hasPermission(req.user.role, 'notifications-add')) {
    return res.status(403).json({ 
      error: "Access denied", 
      message: "Insufficient permissions to create notifications" 
    });
  }
  
  const targetUserId = userId || req.user.id;
  const notification = await Notification.create({
    user: targetUserId,
    createdBy: req.user.id,
    assignedTo: targetUserId,
    type: type || 'general',
    title,
    message,
    priority: priority || 'medium',
  });
  
  const populated = await Notification.findById(notification._id)
    .populate('user', 'name role');
  
  res.status(201).json(populated);
});

const updateNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, title, message, read, priority } = req.body;
  
  // Check if user can edit notifications
  if (!hasPermission(req.user.role, 'notifications-edit')) {
    return res.status(403).json({ 
      error: "Access denied", 
      message: "Insufficient permissions to edit notifications" 
    });
  }
  
  // Find notification with scope checking
  const query = await buildScopeQuery(req.user, 'notifications', { _id: id });
  const notification = await Notification.findOne(query);
  
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  
  const updatePayload = {};
  if (typeof type !== 'undefined') updatePayload.type = type;
  if (typeof title !== 'undefined') updatePayload.title = title;
  if (typeof message !== 'undefined') updatePayload.message = message;
  if (typeof read !== 'undefined') updatePayload.read = read;
  if (typeof priority !== 'undefined') updatePayload.priority = priority;
  
  const updated = await Notification.findByIdAndUpdate(
    id,
    updatePayload,
    { new: true }
  ).populate('user', 'name role');
  
  res.json(updated);
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user can delete notifications
  if (!hasPermission(req.user.role, 'notifications-delete')) {
    return res.status(403).json({ 
      error: "Access denied", 
      message: "Insufficient permissions to delete notifications" 
    });
  }
  
  // Find notification with scope checking
  const query = await buildScopeQuery(req.user, 'notifications', { _id: id });
  const notification = await Notification.findOne(query);
  
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  
  await Notification.findByIdAndDelete(id);
  res.json({ message: "Notification deleted successfully" });
});

const markRead = asyncHandler(async (req, res) => {
  // Build query based on user's role and permissions
  const query = await buildScopeQuery(req.user, 'notifications', { read: false });
  
  const result = await Notification.updateMany(query, { $set: { read: true } });
  
  res.json({ 
    message: "Marked as read", 
    modifiedCount: result.modifiedCount 
  });
});

const markSingleRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Build query based on user's role and permissions
  const query = await buildScopeQuery(req.user, 'notifications', { _id: id });
  
  const updated = await Notification.findOneAndUpdate(
    query,
    { $set: { read: true } },
    { new: true }
  ).populate('user', 'name role');
  
  if (!updated) {
    return res.status(404).json({ message: "Notification not found" });
  }
  
  res.json(updated);
});

const exportNotifications = asyncHandler(async (req, res) => {
  // Check if user can export notifications
  if (!hasPermission(req.user.role, 'notifications-export')) {
    return res.status(403).json({ 
      error: "Access denied", 
      message: "Insufficient permissions to export notifications" 
    });
  }
  
  // Build query based on user's role and permissions
  const query = await buildScopeQuery(req.user, 'notifications');
  
  const notifications = await Notification.find(query)
    .populate('user', 'name role email')
    .sort({ createdAt: -1 });
  
  // Transform data for CSV export
  const csvData = notifications.map(notification => ({
    id: notification._id,
    user_name: notification.user?.name || 'Unknown',
    user_email: notification.user?.email || 'Unknown',
    user_role: notification.user?.role || 'Unknown',
    type: notification.type,
    title: notification.title,
    message: notification.message,
    read: notification.read ? 'Yes' : 'No',
    priority: notification.priority || 'medium',
    created_at: notification.createdAt,
    updated_at: notification.updatedAt,
  }));
  
  res.json({
    data: csvData,
    count: csvData.length,
    exportedAt: new Date().toISOString(),
  });
});

module.exports = { 
  listNotifications, 
  createNotification,
  updateNotification,
  deleteNotification,
  markRead, 
  markSingleRead,
  exportNotifications
};
