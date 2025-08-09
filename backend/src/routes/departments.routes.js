const router = require("express").Router();
const { authenticate, allowRoles } = require("../middleware/auth");
const { Department } = require("../models/Department");
const { asyncHandler } = require("../utils/asyncHandler");

router.use(authenticate, allowRoles("admin"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const depts = await Department.find();
    res.json(depts);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const dept = await Department.create(req.body);
    res.status(201).json(dept);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(dept);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  })
);

module.exports = router;
