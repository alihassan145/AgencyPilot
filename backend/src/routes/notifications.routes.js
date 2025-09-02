const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  listNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  markRead,
  markSingleRead,
  exportNotifications,
} = require("../controllers/notifications.controller");
const { requirePermission } = require("../middleware/permissions");

router.use(authenticate);

// List notifications - available to all roles, scoping handled in controller
router.get(
  "/",
  allowRoles("admin", "manager", "employee", "client"),
  listNotifications
);

// Create notification - only roles with 'notifications-add'
router.post(
  "/",
  allowRoles("admin", "manager", "employee"),
  requirePermission("notifications-add"),
  createNotification
);

// Update notification - only roles with 'notifications-edit'
router.patch(
  "/:id",
  allowRoles("admin", "manager"),
  requirePermission("notifications-edit"),
  updateNotification
);

// Delete notification - only roles with 'notifications-delete'
router.delete(
  "/:id",
  allowRoles("admin"),
  requirePermission("notifications-delete"),
  deleteNotification
);

// Mark all as read - available to all roles, scoping handled in controller
router.post(
  "/mark-read",
  allowRoles("admin", "manager", "employee", "client"),
  markRead
);

// Mark single as read - available to all roles with access to that notification
router.post(
  "/:id/mark-read",
  allowRoles("admin", "manager", "employee", "client"),
  markSingleRead
);

// Export notifications - only roles with 'notifications-export'
router.get(
  "/export",
  allowRoles("admin"),
  requirePermission("notifications-export"),
  exportNotifications
);

module.exports = router;
