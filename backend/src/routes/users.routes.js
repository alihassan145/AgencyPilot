const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  listUsers,
  getMe,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

router.use(authenticate);

router.get("/me", getMe);
router.get("/", allowRoles("admin"), listUsers);
router.patch("/:id", allowRoles("admin"), updateUser);
router.delete("/:id", allowRoles("admin"), deleteUser);

module.exports = router;
