const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  listUsers,
  getMe,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");
const { adminResetPassword } = require("../controllers/auth.controller");

router.use(authenticate);

router.get("/me", getMe);
router.get("/", allowRoles("admin"), listUsers);
router.post("/", allowRoles("admin"), createUser);
router.patch("/:id", allowRoles("admin"), updateUser);
router.post("/:id/reset-password", allowRoles("admin"), adminResetPassword);
router.delete("/:id", allowRoles("admin"), deleteUser);

module.exports = router;
