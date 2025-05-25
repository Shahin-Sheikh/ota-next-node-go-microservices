const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;
const User = require("../models/user.model");
const UserService = require("../models/user-service.model");
const { validateService } = require("../utils/service-validator.util");

const tokenBlacklist = new Set();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No authorization token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({
      success: false,
      message: "Token revoked",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      ignoreExpiration: false,
    });

    // Validate service if service code exists
    if (decoded.serviceSecret) {
      const service = await validateService(decoded.serviceSecret);
      if (!service) {
        return res.status(403).json({
          success: false,
          message: "Invalid service",
        });
      }

      const serviceAccess = await UserService.findOne({
        user: decoded.id,
        service: service._id,
      });

      if (!serviceAccess) {
        return res.status(403).json({
          success: false,
          message: "User not authorized for this service",
        });
      }
    }

    req.user = {
      ...decoded,
      rawToken: token,
      userDoc: await User.findById(decoded.id).select("-password"),
    };

    next();
  } catch (err) {
    let message = "Invalid token";
    let status = 401;

    if (err instanceof TokenExpiredError) {
      message = "Token expired";
      status = 403;
    } else if (err.name === "JsonWebTokenError") {
      message = "Malformed token";
    }

    return res.status(status).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

authMiddleware.revokeToken = (token) => {
  tokenBlacklist.add(token);
};

module.exports = authMiddleware;
