const jwt = require("jsonwebtoken");
const Tutor = require("../models/tutor");

// ⚠️ MUST MATCH tutorRoutes.js
const JWT_SECRET = "TUTOR_SECRET_KEY";

module.exports = async (req, res, next) => {
  try {
    // Accept: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, access denied"
      });
    }

    // 🔑 VERIFY TOKEN
    const decoded = jwt.verify(token, JWT_SECRET);

    console.log("DECODED =", decoded);
console.log("TUTOR ID =", decoded.tutorId);

    // 🔴 decoded.tutorId (NOT decoded.id)
    const tutor = await Tutor.findById(decoded.tutorId).select("-password");
    console.log("FOUND TUTOR =", tutor);

    if (!tutor) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // attach tutor to request
    req.tutor = tutor;
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token error: " + err.message
    });
  }
};
