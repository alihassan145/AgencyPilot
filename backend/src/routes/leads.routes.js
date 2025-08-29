const router = require("express").Router();
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  createLead,
  listLeads,
  getLead,
  updateLead,
  deleteLead,
} = require("../controllers/leads.controller");

router.use(authenticate);

// List leads – employee+ can view; controller scopes down.
router.get("/", allowRoles("employee+"), listLeads);

// Create lead – manager+
router.post(
  "/",
  allowRoles("manager+"),
  [body("name").isString().notEmpty()],
  validate,
  createLead
);

// Get specific lead
router.get("/:id", allowRoles("employee+"), getLead);

// Update lead
router.patch(
  "/:id",
  allowRoles("manager+"),
  [param("id").isString().notEmpty()],
  validate,
  updateLead
);

// Delete lead
router.delete(
  "/:id",
  allowRoles("manager+"),
  [param("id").isString().notEmpty()],
  validate,
  deleteLead
);

module.exports = router;