const jwt = require("jsonwebtoken");
const {
  jwtSecret,
  jwtRefreshSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
} = require("../config/jwt.config");
const CustomerUser = require("../models/customer-users.model");
const createServiceUserModel = require("../models/service-user-factory");
const ServiceRegistry = require("../models/service-registry.model");
const bcrypt = require("bcryptjs");

// Generate JWT token
const generateTokens = (id, userType) => {
  const accessToken = jwt.sign({ id, userType }, jwtSecret, {
    expiresIn: accessTokenExpiresIn, // Make sure this is defined
  });

  const refreshToken = jwt.sign({ id, userType }, jwtRefreshSecret, {
    expiresIn: refreshTokenExpiresIn, // Make sure this is defined
  });

  return { accessToken, refreshToken };
};

// Add refresh token to user
const addRefreshToken = async (user, refreshToken, userType) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days

  if (userType === "customer") {
    await CustomerUser.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          token: refreshToken,
          expires,
        },
      },
    });
  } else {
    await ServiceUser.findByIdAndUpdate(user._id, {
      $push: {
        refreshTokens: {
          token: refreshToken,
          expires,
        },
      },
    });
  }
};

// Customer registration
exports.registerCustomer = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await CustomerUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await CustomerUser.create({ email, password, name });
    const { accessToken, refreshToken } = generateTokens(user._id, "customer");

    await addRefreshToken(user, refreshToken, "customer");

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Customer login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await CustomerUser.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, "customer");
    await addRefreshToken(user, refreshToken, "customer");

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);

    let user;
    if (decoded.userType === "customer") {
      user = await CustomerUser.findOne({
        _id: decoded.id,
        "refreshTokens.token": refreshToken,
        "refreshTokens.expires": { $gt: new Date() },
      });
    } else {
      user = await ServiceUser.findOne({
        _id: decoded.id,
        "refreshTokens.token": refreshToken,
        "refreshTokens.expires": { $gt: new Date() },
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id,
      decoded.userType
    );

    // Remove old refresh token and add new one
    if (decoded.userType === "customer") {
      await CustomerUser.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
      await addRefreshToken(user, newRefreshToken, "customer");
    } else {
      await ServiceUser.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
      await addRefreshToken(user, newRefreshToken, "service");
    }

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Service user registration (protected by service secret)
exports.registerServiceUser = async (req, res) => {
  try {
    const { username, password, roles } = req.body;
    const service = req.service;
    const ServiceUser = createServiceUserModel(service);
    const existingUser = await ServiceUser.findOne({ username, service });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already in use for this service",
      });
    }

    const user = await ServiceUser.create({
      username,
      password,
      service,
      roles: roles || ["user"],
    });

    const token = generateToken(user._id, "service");

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        service: user.service,
        roles: user.roles,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Service user login (protected by service secret)
exports.loginServiceUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const service = req.service;
    const ServiceUser = createServiceUserModel(service);
    const user = await ServiceUser.findOne({ username, service }).select(
      "+password"
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id, "service");

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        service: user.service,
        roles: user.roles,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Logout endpoint
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token to get user type
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);

    if (decoded.userType === "customer") {
      await CustomerUser.updateOne(
        { _id: decoded.id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    } else {
      await ServiceUser.updateOne(
        { _id: decoded.id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Initialize service (one-time setup)
exports.initializeService = async (req, res) => {
  try {
    const { serviceName, serviceSecret, allowedDomains } = req.body;

    if (
      !["admin", "accounting", "inventory", "shipping"].includes(serviceName)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid service name",
      });
    }

    const existingService = await ServiceRegistry.findOne({ serviceName });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already initialized",
      });
    }

    const hashedSecret = await bcrypt.hash(serviceSecret, 12);

    const service = await ServiceRegistry.create({
      serviceName,
      serviceSecret: hashedSecret,
      allowedDomains: allowedDomains || [],
    });

    // Create the collection by initializing the model
    createServiceUserModel(serviceName);

    res.status(201).json({
      success: true,
      service: {
        id: service._id,
        serviceName: service.serviceName,
        allowedDomains: service.allowedDomains,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
