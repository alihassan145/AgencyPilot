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

router.get("/", allowRoles("employee+"), listReports);
router.post(
  "/",
  allowRoles("employee+"),
  [body("title").isString().notEmpty(), body("content").isString().notEmpty()],
  validate,
  submitReport
);
router.post(
  "/:id/approve",
  allowRoles("manager+"),
  [param("id").isString().notEmpty()],
  validate,
  approveReport
);
router.post(
  "/:id/reject",
  allowRoles("manager+"),
  [param("id").isString().notEmpty(), body("reason").optional().isString()],
  validate,
  rejectReport
);

module.exports = router;
