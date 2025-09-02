const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ROLES = ["admin", "manager", "employee", "client"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    // Remove enum restriction to support dynamically created roles
    role: { type: String, required: true, default: "employee" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    reportingManagers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User, ROLES };
