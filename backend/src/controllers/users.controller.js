const { User } = require("../models/User");
const { Department } = require("../models/Department");
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

const createUser = asyncHandler(async (req, res) => {
  try {
    const userData = req.body;
    
    // Check if user with email already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    
    // Map accessLevel to role and prepare user data
    const roleMapping = {
      'Admin': 'admin',
      'Manager': 'manager',
      'Employee': 'employee'
    };
    
    // Handle department lookup by name
    let departmentId = null;
    if (userData.department) {
      const department = await Department.findOne({ name: userData.department });
      if (department) {
        departmentId = department._id;
      }
    }
    
    const userPayload = {
      name: userData.name,
      email: userData.email,
      password: "defaultPassword123", // This should be changed by the user on first login
      role: roleMapping[userData.accessLevel] || 'employee',
      department: departmentId,
      reportingManagers: userData.reportingManagers || [],
      isActive: userData.status === 'Active'
    };
    
    // Create new user
    const newUser = await User.create(userPayload);
    
    const user = await User.findById(newUser._id)
      .select("-password")
      .populate("department reportingManagers client");
      
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ 
      message: "Failed to create user", 
      error: error.message 
    });
  }
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

module.exports = { listUsers, getMe, createUser, updateUser, deleteUser };
