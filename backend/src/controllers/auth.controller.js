const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, ROLES } = require("../models/User");
const { asyncHandler } = require("../utils/asyncHandler");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role = "employee",
    department,
    reportingManagers,
    client,
  } = req.body;
  if (!ROLES.includes(role))
    return res.status(400).json({ message: "Invalid role" });
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });
  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    reportingManagers,
    client,
  });
  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });
  const token = signToken(user);
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!user) return res.status(404).json({ message: "User not found" });
  const ok = await user.comparePassword(currentPassword);
  if (!ok)
    return res.status(400).json({ message: "Current password incorrect" });
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});

const adminResetPassword = asyncHandler(async (req, res) => {
  const { userId, newPassword } = req.body;
  const target = await User.findById(userId).select("+password");
  if (!target) return res.status(404).json({ message: "User not found" });
  target.password = newPassword;
  await target.save();
  res.json({ message: "Password reset" });
});

module.exports = { register, login, changePassword, adminResetPassword };
