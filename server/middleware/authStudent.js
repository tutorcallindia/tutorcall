const jwt = require("jsonwebtoken");
const Student = require("../models/student");

const JWT_SECRET = "MY_SECRET_KEY"; // Same as student login

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : req.header("x-auth-token");

    if (!token) {
      return res.json({ success: false, message: "No token, access denied" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.student = await Student.findById(decoded.id).select("-password");

    if (!req.student) {
      return res.json({ success: false, message: "Invalid or expired token" });
    }

    next();

  } catch (err) {
    res.json({ success: false, message: "Token error: " + err.message });
  }
};
