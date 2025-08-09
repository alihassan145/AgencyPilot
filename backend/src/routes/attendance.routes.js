const router = require("express").Router();
const { query } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  checkIn,
  checkOut,
  listAttendance,
} = require("../controllers/attendance.controller");

router.use(authenticate);

router.post("/check-in", allowRoles("admin", "manager", "employee"), checkIn);
router.post("/check-out", allowRoles("admin", "manager", "employee"), checkOut);
router.get(
  "/",
  allowRoles("admin", "manager", "employee"),
  [
    query("employee").optional().isString(),
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ],
  validate,
  listAttendance
);

module.exports = router;
