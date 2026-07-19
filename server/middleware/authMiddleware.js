const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No Token
    if (!token) {
      return res.status(401).json({
        success: false,
        msg: "Access Denied. No Token Provided",
      });
    }

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find Admin
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        msg: "Admin not found",
      });
    }

    // Store Admin in Request
    req.admin = admin;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      msg: "Invalid or Expired Token",
    });
  }
};

module.exports = protect;