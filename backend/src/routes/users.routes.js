const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  listUsers,
  getMe,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/users.controller");

router.use(authenticate);

router.get("/me", getMe);
router.get("/", allowRoles("admin"), listUsers);
router.post("/", allowRoles("admin"), createUser);
router.patch("/:id", allowRoles("admin"), updateUser);
router.delete("/:id", allowRoles("admin"), deleteUser);

module.exports = router;
