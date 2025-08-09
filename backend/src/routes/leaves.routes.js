const router = require("express").Router();
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  applyLeave,
  listLeaves,
  decideLeave,
} = require("../controllers/leaves.controller");

router.use(authenticate);

router.get("/", allowRoles("admin", "manager", "employee"), listLeaves);
router.post(
  "/",
  allowRoles("admin", "manager", "employee"),
  [
    body("from").isISO8601(),
    body("to").isISO8601(),
    body("reason").isString().notEmpty(),
  ],
  validate,
  applyLeave
);
router.post(
  "/:id/decide",
  allowRoles("admin", "manager"),
  [
    param("id").isString().notEmpty(),
    body("action").isIn(["approve", "reject"]),
  ],
  validate,
  decideLeave
);

module.exports = router;
