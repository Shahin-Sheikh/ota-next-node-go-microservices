const createServiceUserModel = require("../models/service-user-factory.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");

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

    const { accessToken, refreshToken } = generateTokens(user._id, "service");
    await addRefreshToken(user, refreshToken, "service");

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
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

    const { accessToken, refreshToken } = generateTokens(user._id, "service");
    await addRefreshToken(user, refreshToken, "service");

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
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
