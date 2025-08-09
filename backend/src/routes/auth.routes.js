const router = require("express").Router();
const { body } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  register,
  login,
  changePassword,
  adminResetPassword,
} = require("../controllers/auth.controller");

router.post(
  "/login",
  [body("email").isEmail(), body("password").isString().isLength({ min: 6 })],
  validate,
  login
);
router.post(
  "/register",
  authenticate,
  allowRoles("admin"),
  [
    body("name").isString().notEmpty(),
    body("email").isEmail(),
    body("password").isString().isLength({ min: 6 }),
    body("role").optional().isIn(["admin", "manager", "employee", "client"]),
  ],
  validate,
  register
);
router.post(
  "/change-password",
  authenticate,
  [
    body("currentPassword").isString().notEmpty(),
    body("newPassword").isString().isLength({ min: 6 }),
  ],
  validate,
  changePassword
);
router.post(
  "/admin/reset-password",
  authenticate,
  allowRoles("admin"),
  [
    body("userId").isString().notEmpty(),
    body("newPassword").isString().isLength({ min: 6 }),
  ],
  validate,
  adminResetPassword
);

module.exports = router;
