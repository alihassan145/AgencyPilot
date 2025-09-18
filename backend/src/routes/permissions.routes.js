const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const { PERMISSIONS, getUserPermissions } = require("../middleware/permissions");
const { Role } = require("../models/Role");
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");

// Helper to normalize Mongoose Map/POJO to a plain object
function mapToPlain(val) {
  if (!val) return {};
  // Prefer explicit Mongoose Map detection (has get/set)
  if (typeof val.get === "function" && typeof val.set === "function") {
    const obj = {};
    // Mongoose Map supports forEach((v,k) => ...)
    if (typeof val.forEach === "function") {
      val.forEach((v, k) => {
        obj[k] = v;
      });
      return obj;
    }
    // Fallback via keys/get
    if (typeof val.keys === "function") {
      for (const k of val.keys()) obj[k] = val.get(k);
      return obj;
    }
  }
  // Mongoose subdoc or other objects that expose toObject
  if (typeof val.toObject === "function") return val.toObject();
  // Native Map
  if (val instanceof Map) return Object.fromEntries(val);
  // Plain object
  if (typeof val === "object") return { ...val };
  return {};
}

// Public for any authenticated user: get my permissions
router.get("/my", authenticate, async (req, res, next) => {
  try {
    const perms = await getUserPermissions(req.user.role);
    return res.json(perms);
  } catch (err) {
    next(err);
  }
});

// All management endpoints below are admin-only
router.use(authenticate, allowRoles("admin"));

// Get the full permissions matrix (DB-first merged with in-memory defaults)
router.get("/", async (req, res, next) => {
  try {
    const rolesFromDb = await Role.find({}).select("name permissions");
    const roleNames = new Set(Object.keys(PERMISSIONS));
    rolesFromDb.forEach((r) => roleNames.add(r.name));

    const matrix = {};
    for (const name of roleNames) {
      const base = PERMISSIONS[name] || {};
      const found = rolesFromDb.find((r) => r.name === name);
      const fromDb = found ? mapToPlain(found.permissions) : {};
      // Merge base and DB (DB overrides base); ensures complete key coverage for UI
      matrix[name] = { ...base, ...fromDb };
    }

    res.json({ roles: Array.from(roleNames), permissions: matrix });
  } catch (err) {
    next(err);
  }
});

// Get permissions for a specific role (dynamic, merged with in-memory defaults)
router.get(
  "/:role",
  [param("role").isString().trim().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { role } = req.params;
      const base = PERMISSIONS[role] || {};
      const roleDoc = await Role.findOne({ name: role }).select("permissions");
      if (roleDoc) {
        const fromDb = mapToPlain(roleDoc.permissions);
        return res.json({ ...base, ...fromDb });
      }
      return res.json(base);
    } catch (err) {
      next(err);
    }
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
  async (req, res, next) => {
    try {
      const { name, base = "employee" } = req.body;
      const key = String(name).trim();

      if (!key) return res.status(400).json({ message: "Role name is required" });
      const existing = await Role.findOne({ name: key }).select("_id");
      if (existing) return res.status(409).json({ message: "Role already exists" });

      const baseDoc = await Role.findOne({ name: base }).select("permissions");
      const basePerms = baseDoc ? mapToPlain(baseDoc.permissions) : (PERMISSIONS[base] || {});

      const created = await Role.create({ name: key, permissions: basePerms });
      return res.status(201).json({ role: created.name, permissions: basePerms });
    } catch (err) {
      next(err);
    }
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
  async (req, res, next) => {
    try {
      const { role } = req.params;
      const { updates } = req.body;

      // Determine base to validate allowed keys
      const base = PERMISSIONS[role];
      if (!base) return res.status(404).json({ message: "Role not found" });
      const allowedKeys = new Set(Object.keys(base));

      let roleDoc = await Role.findOne({ name: role }).select("permissions name");
      // Initialize doc if not in DB
      if (!roleDoc) {
        roleDoc = await Role.create({ name: role, permissions: {} });
      }

      // Apply updates directly to Mongoose Map to ensure persistence
      Object.keys(updates || {}).forEach((k) => {
        if (allowedKeys.has(k)) {
          roleDoc.permissions.set(k, Boolean(updates[k]));
        }
      });

      roleDoc.markModified("permissions");
      await roleDoc.save();

      // Build merged snapshot for response
      const merged = { ...base, ...mapToPlain(roleDoc.permissions) };

      return res.json({ role: roleDoc.name, permissions: merged });
    } catch (err) {
      next(err);
    }
  }
);

// Delete a custom role (system roles are protected)
router.delete(
  "/:role",
  [param("role").isString().trim().notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { role } = req.params;
      const protectedRoles = new Set(["admin", "manager", "employee", "client"]);
      if (protectedRoles.has(role)) return res.status(400).json({ message: "Cannot delete system role" });

      const result = await Role.findOneAndDelete({ name: role });
      if (!result) return res.status(404).json({ message: "Role not found" });

      return res.json({ message: "Role deleted" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;