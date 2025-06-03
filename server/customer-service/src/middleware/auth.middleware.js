const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  // 1. Get Authorization header safely
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authorization header missing or malformed",
    });
  }

  // 2. Extract token safely
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token missing",
    });
  }

  console.log("Extracted Token:", token);

  // 3. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      let errorMessage = "Invalid token";
      if (err.name === "TokenExpiredError") {
        errorMessage = "Token expired";
      } else if (err.name === "JsonWebTokenError") {
        errorMessage = "Malformed token";
      }

      return res.status(403).json({
        success: false,
        error: errorMessage,
      });
    }

    // 4. Match actual token payload
    if (!decoded.id || !decoded.userType) {
      return res.status(403).json({
        success: false,
        error: "Token payload invalid",
      });
    }

    // 5. Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.userType,
      ...decoded,
    };

    next();
  });
}

module.exports = authenticateToken;
