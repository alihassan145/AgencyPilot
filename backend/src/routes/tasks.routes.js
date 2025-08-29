const router = require("express").Router();
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks.controller");

router.use(authenticate);

router.get("/", listTasks);
router.get("/:id", getTask);
router.post(
  "/",
  allowRoles("manager+"),
  [
    body("title").isString().notEmpty(),
    body("assignedTo").isString().notEmpty(),
    body("reportingManager").isString().notEmpty(),
    body("priority").optional().isIn(["low", "medium", "high"]),
    body("status").optional().isIn(["todo", "in_progress", "done"]),
  ],
  validate,
  createTask
);
router.patch(
  "/:id",
  allowRoles("employee+"),
  [param("id").isString().notEmpty()],
  validate,
  updateTask
); // employees can update status; managers/admins can update all
router.delete(
  "/:id",
  allowRoles("manager+"),
  [param("id").isString().notEmpty()],
  validate,
  deleteTask
);

module.exports = router;
