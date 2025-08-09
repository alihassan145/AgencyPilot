const jwt = require("jsonwebtoken");
const { User } = require("../models/User");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : req.cookies?.token;
    if (!token)
      return res.status(401).json({ message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select("+password");
    if (!user || !user.isActive)
      return res.status(401).json({ message: "Invalid credentials" });
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      clientId: user.client ? user.client.toString() : undefined,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function allowRoles(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user)
      return res.status(401).json({ message: "Authentication required" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

module.exports = { authenticate, allowRoles };
