const router = require("express").Router();
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  submitReport,
  listReports,
  approveReport,
  rejectReport,
} = require("../controllers/reports.controller");

router.use(authenticate);

router.get("/", allowRoles("admin", "manager", "employee"), listReports);
router.post(
  "/",
  allowRoles("admin", "manager", "employee"),
  [body("title").isString().notEmpty(), body("content").isString().notEmpty()],
  validate,
  submitReport
);
router.post(
  "/:id/approve",
  allowRoles("admin", "manager"),
  [param("id").isString().notEmpty()],
  validate,
  approveReport
);
router.post(
  "/:id/reject",
  allowRoles("admin", "manager"),
  [param("id").isString().notEmpty(), body("reason").optional().isString()],
  validate,
  rejectReport
);

module.exports = router;
