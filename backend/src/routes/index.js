const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./users.routes"));
router.use("/clients", require("./clients.routes"));
router.use("/tasks", require("./tasks.routes"));
router.use("/departments", require("./departments.routes"));
router.use("/reports", require("./reports.routes"));
router.use("/attendance", require("./attendance.routes"));
router.use("/leaves", require("./leaves.routes"));
router.use("/payroll", require("./payroll.routes"));
router.use("/notifications", require("./notifications.routes"));
router.use("/recent-activities", require("./recentActivity.routes"));

module.exports = router;
