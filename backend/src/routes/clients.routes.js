const router = require("express").Router();
const { body, param } = require("express-validator");
const { validate } = require("../middleware/validate");
const { authenticate, allowRoles } = require("../middleware/auth");
const {
  createClient,
  listClients,
  getClient,
  updateClient,
  deleteClient,
} = require("../controllers/clients.controller");

router.use(authenticate);

router.get("/", allowRoles("admin", "manager", "employee"), listClients);
router.get("/:id", allowRoles("admin", "manager", "employee"), getClient);

router.post(
  "/",
  allowRoles("admin"),
  [
    body("companyName").isString().notEmpty(),
    body("contactPerson").isString().notEmpty(),
    body("mobile").isString().notEmpty(),
    body("email").isEmail(),
    body("price").optional().isNumeric(),
  ],
  validate,
  createClient
);
router.patch(
  "/:id",
  allowRoles("admin"),
  [param("id").isString().notEmpty()],
  validate,
  updateClient
);
router.delete(
  "/:id",
  allowRoles("admin"),
  [param("id").isString().notEmpty()],
  validate,
  deleteClient
);

module.exports = router;
