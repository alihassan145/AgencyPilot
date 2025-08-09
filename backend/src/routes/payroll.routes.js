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

router.get("/config", allowRoles("admin", "manager", "employee"), getConfig);
router.post(
  "/config",
  allowRoles("admin"),
  [
    body("graceMinutes").optional().isInt({ min: 0 }),
    body("latePenalty").optional().isNumeric(),
    body("overtimeEnabled").optional().isBoolean(),
    body("overtimeBonusPerHour").optional().isNumeric(),
    body("officialStart").optional().isString(),
    body("officialEnd").optional().isString(),
    body("defaultBaseSalary").optional().isNumeric(),
  ],
  validate,
  setConfig
);
router.get(
  "/me",
  allowRoles("admin", "manager", "employee"),
  [
    query("month")
      .optional()
      .matches(/^\d{4}-\d{2}$/),
    query("baseSalary").optional().isNumeric(),
  ],
  validate,
  myEarnings
);

module.exports = router;
