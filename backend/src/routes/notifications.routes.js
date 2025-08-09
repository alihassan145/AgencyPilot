const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  listNotifications,
  markRead,
} = require("../controllers/notifications.controller");

router.use(authenticate);

router.get(
  "/",
  allowRoles("admin", "manager", "employee", "client"),
  listNotifications
);
router.post(
  "/mark-read",
  allowRoles("admin", "manager", "employee", "client"),
  markRead
);

module.exports = router;
