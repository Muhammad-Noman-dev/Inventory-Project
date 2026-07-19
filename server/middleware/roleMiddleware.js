const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        msg: "Unauthorized",
      });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        msg: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = roleCheck;