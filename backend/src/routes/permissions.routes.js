const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const { PERMISSIONS, getUserPermissions } = require("../middleware/permissions");
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");

// Public for any authenticated user: get my permissions
router.get("/my", authenticate, (req, res) => {
  return res.json(getUserPermissions(req.user.role));
});

// All management endpoints below are admin-only
router.use(authenticate, allowRoles("admin"));

// Get the full permissions matrix
router.get("/", (req, res) => {
  res.json({ roles: Object.keys(PERMISSIONS), permissions: PERMISSIONS });
});

// Get permissions for a specific role (dynamic)
router.get(
  "/:role",
  [param("role").isString().trim().notEmpty()],
  validate,
  (req, res) => {
    const { role } = req.params;
    res.json(PERMISSIONS[role] || {});
  }
);

// Create a new role by cloning from a base role (default: employee)
router.post(
  "/roles",
  [
    body("name").isString().trim().notEmpty(),
    body("base").optional().isString().trim(),
  ],
  validate,
  (req, res) => {
    const { name, base = "employee" } = req.body;
    const key = String(name).trim();

    if (!key) return res.status(400).json({ message: "Role name is required" });
    if (PERMISSIONS[key]) return res.status(409).json({ message: "Role already exists" });
    if (!PERMISSIONS[base]) return res.status(400).json({ message: "Base role not found" });

    // Shallow clone base permissions
    PERMISSIONS[key] = { ...PERMISSIONS[base] };

    return res.status(201).json({ role: key, permissions: PERMISSIONS[key] });
  }
);

// Update permissions for a specific role (partial update)
router.put(
  "/:role",
  [
    param("role").isString().trim().notEmpty(),
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

// Delete a custom role (system roles are protected)
router.delete(
  "/:role",
  [param("role").isString().trim().notEmpty()],
  validate,
  (req, res) => {
    const { role } = req.params;
    const protectedRoles = new Set(["admin", "manager", "employee", "client"]);
    if (protectedRoles.has(role)) return res.status(400).json({ message: "Cannot delete system role" });
    if (!PERMISSIONS[role]) return res.status(404).json({ message: "Role not found" });

    delete PERMISSIONS[role];
    return res.json({ message: "Role deleted" });
  }
);

module.exports = router;