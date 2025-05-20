const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  // 1. More robust header checking
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authorization header missing or malformed",
    });
  }

  // 2. Extract token
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token missing",
    });
  }

  // 3. Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // 4. More specific error messages
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

    // 5. Additional payload validation
    if (!decoded.userId || !decoded.role) {
      return res.status(403).json({
        success: false,
        error: "Token payload invalid",
      });
    }

    // 6. Attach user to request
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      // add other necessary fields from the token
      ...decoded,
    };

    next();
  });
}

module.exports = authenticateToken;
