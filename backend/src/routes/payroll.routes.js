const router = require("express").Router();
const { body, query } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  setConfig,
  getConfig,
  myEarnings,
} = require("../controllers/payroll.controller");

router.use(authenticate);

router.get("/config", allowRoles("employee+"), getConfig);
router.post(
  "/config",
  allowRoles("admin"),
  [
    body("graceMinutes").optional().isInt({ min: 0 }),
    body("latePenalty").optional().isNumeric(),
    body("latePenaltyUnit")
      .optional()
      .isIn(["per_minute", "per_hour", "per_day"]),
    body("overtimeEnabled").optional().isBoolean(),
    body("overtimeBonusPerHour").optional().isNumeric(),
    body("overtimeAmount").optional().isNumeric(),
    body("overtimeUnit").optional().isIn(["per_minute", "per_hour", "per_day"]),
    body("officialStart").optional().isString(),
    body("officialEnd").optional().isString(),
    body("defaultBaseSalary").optional().isNumeric(),
    body("professionalTaxThreshold").optional().isNumeric(),
    body("professionalTaxAmount").optional().isNumeric(),
  ],
  validate,
  setConfig
);
router.get(
  "/me",
  allowRoles("employee+"),
  [
    query("month")
      .optional()
      .matches(/^\d{4}-\d{2}$/),
    query("baseSalary").optional().isNumeric(),
    query("unapprovedAbsentDays").optional().isInt({ min: 0 }),
    query("workingDays").optional().isInt({ min: 1 }),
  ],
  validate,
  myEarnings
);

module.exports = router;
