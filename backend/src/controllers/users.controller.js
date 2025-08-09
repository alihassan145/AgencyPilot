const { User } = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .populate("department reportingManagers client");
  res.json(users);
});

const getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.user.id)
    .select("-password")
    .populate("department reportingManagers client");
  res.json(me);
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  delete payload.password;
  const user = await User.findByIdAndUpdate(id, payload, { new: true }).select(
    "-password"
  );
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: "User deleted" });
});

module.exports = { listUsers, getMe, updateUser, deleteUser };
