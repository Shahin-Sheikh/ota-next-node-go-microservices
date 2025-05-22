const User = require("../models/user.model");
const Service = require("../models/service.model");
const UserService = require("../models/user-service.model"); // New model for many-to-many relationship
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// Token generation functions
const generateAccessToken = (user, serviceCode) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      serviceCode,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
};

const generateRefreshToken = (user, serviceCode) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      serviceCode,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

// Register controller
const register = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, phone, firstName, lastName, dob, serviceSecret } =
      req.body;

    // Check if service exists
    const service = await Service.findOne({ secret: serviceSecret });
    if (!service) {
      return res.status(403).json({ message: "Invalid service secret" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    const isNewUser = !user;

    if (isNewUser) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      user = new User({
        email,
        password: hashedPassword,
        phone,
        firstName,
        lastName,
        dob,
      });

      await user.save();
    }

    // Check if user is already registered with this service
    const existingUserService = await UserService.findOne({
      user: user._id,
      service: service._id,
    });

    if (existingUserService) {
      return res.status(409).json({
        message: "User already exist",
        isNewUser: false,
      });
    }

    // Create user-service relationship
    const userService = new UserService({
      user: user._id,
      service: service._id,
      serviceSecret: serviceSecret, // Storing the secret used for registration
    });

    await userService.save();

    // Generate tokens
    const accessToken = generateAccessToken(user, service.code);
    const refreshToken = generateRefreshToken(user, service.code);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dob: user.dob,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
};

// Login controller
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, serviceSecret } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify service
    const service = await Service.findOne({ secret: serviceSecret });
    if (!service) {
      return res.status(403).json({ message: "Invalid service secret" });
    }

    // Check if user is registered with this service
    const userService = await UserService.findOne({
      user: user._id,
      service: service._id,
    });

    if (!userService) {
      return res.status(403).json({
        message: "User not registered",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user, service.code);
    const refreshToken = generateRefreshToken(user, service.code);

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dob: user.dob,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Login failed",
      error: err.message,
    });
  }
};

// Refresh token controller
const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Verify user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify service exists
    const service = await Service.findOne({ code: decoded.serviceCode });
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Verify user is registered with this service
    const userService = await UserService.findOne({
      user: user._id,
      service: service._id,
    });
    if (!userService) {
      return res.status(403).json({
        message: "User not registered",
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user, service.code);

    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({
      message: "Invalid refresh token",
      error: err.message,
    });
  }
};

// Get current user info
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dob: user.dob,
        serviceCode: req.user.serviceCode,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching user data",
      error: err.message,
    });
  }
};

module.exports = { register, login, refreshAccessToken, getMe };
