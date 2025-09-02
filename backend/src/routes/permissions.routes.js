const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const { PERMISSIONS } = require("../middleware/permissions");
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");

// All permissions endpoints are admin-only
router.use(authenticate, allowRoles("admin"));

// Get the full permissions matrix
router.get("/", (req, res) => {
  res.json({ roles: Object.keys(PERMISSIONS), permissions: PERMISSIONS });
});

// Get permissions for a specific role
router.get(
  "/:role",
  [param("role").isIn(["admin", "manager", "employee", "client"])],
  validate,
  (req, res) => {
    const { role } = req.params;
    res.json(PERMISSIONS[role] || {});
  }
);

// Update permissions for a specific role (partial update)
router.put(
  "/:role",
  [
    param("role").isIn(["admin", "manager", "employee", "client"]),
    body("updates").isObject(),
  ],
  validate,
  (req, res) => {
    const { role } = req.params;
    const { updates } = req.body;

    if (!PERMISSIONS[role]) return res.status(404).json({ message: "Role not found" });
    if (typeof updates !== "object") return res.status(400).json({ message: "Invalid updates" });

    // Only update existing permission keys; ignore unknown keys for safety
    Object.keys(updates).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(PERMISSIONS[role], key)) {
        PERMISSIONS[role][key] = Boolean(updates[key]);
      }
    });

    return res.json({ role, permissions: PERMISSIONS[role] });
  }
);

module.exports = router;