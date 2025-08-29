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

// Role hierarchy (higher value = higher privilege)
const ROLE_RANK = { admin: 3, manager: 2, employee: 1, client: 0 };

function allowRoles(...roles) {
  // If hierarchy flag detected in roles array (e.g., 'manager+'), we allow higher ranks automatically.
  // Example: allowRoles('manager+') means manager or any higher role (admin).
  const parsed = roles.map((r) => ({ base: r.replace(/\+$/, ""), hierarchical: r.endsWith("+") }));

  return function roleGuard(req, res, next) {
    if (!req.user)
      return res.status(401).json({ message: "Authentication required" });

    const userRole = req.user.role;

    // Direct allow when exact match in simple roles list
    if (roles.includes(userRole)) return next();

    // Evaluate hierarchical permissions
    const allowed = parsed.some(({ base, hierarchical }) => {
      if (!hierarchical) return false;
      return ROLE_RANK[userRole] >= ROLE_RANK[base];
    });

    if (!allowed)
      return res.status(403).json({ message: "Forbidden" });

    next();
  };
}

module.exports = { authenticate, allowRoles };
