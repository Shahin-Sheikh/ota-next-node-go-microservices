const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt.config");
const CustomerUser = require("../models/customer-users.model");
const ServiceUser = require("../models/service-user-factory");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.userType === "customer") {
      req.user = await CustomerUser.findById(decoded.id).select(
        "-password -refreshTokens"
      );
    } else {
      req.user = await ServiceUser.findById(decoded.id).select(
        "-password -refreshTokens"
      );
    }

    req.userType = decoded.userType;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Middleware to check if user is a service user
exports.serviceUser = (req, res, next) => {
  if (req.userType !== "service") {
    return res.status(403).json({
      success: false,
      message: "Not authorized as a service user",
    });
  }
  next();
};

// Middleware to check if user is a customer
exports.customer = (req, res, next) => {
  if (req.userType !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Not authorized as a customer",
    });
  }
  next();
};
