const mongoose = require("mongoose");

// Role model to persist permissions in DB
// name: role key (e.g., 'admin', 'manager', 'employee', 'client', or custom)
// permissions: a map of permission-key -> boolean
const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true, trim: true },
    permissions: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);

module.exports = { Role };