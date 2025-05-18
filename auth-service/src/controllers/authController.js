const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const VALID_SERVICE_TYPES = ["admin", "customer", "hotel"]; // Add your valid types

const generateAccessToken = (user, serviceType) => {
  return jwt.sign(
    { id: user._id, email: user.email, serviceType },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
};

const generateRefreshToken = (user, serviceType) => {
  return jwt.sign(
    {
      id: user._id,
      serviceType,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

// Only allow "customer" type for public registration
const register = async (req, res) => {
  try {
    const { email, password, phone, firstName, lastName, dob } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      phone,
      firstName,
      lastName,
      dob,
      serviceTypes: ["customer"], // set default service role
    });

    await user.save();

    const accessToken = generateAccessToken(user, "customer");
    const refreshToken = generateRefreshToken(user, "customer");

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
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password, serviceType } = req.body;

  if (!VALID_SERVICE_TYPES.includes(serviceType)) {
    return res.status(400).json({ message: "Invalid service type" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user has this service access
    if (!user.serviceTypes.includes(serviceType)) {
      return res.status(403).json({ message: "Unauthorized for this service" });
    }

    const accessToken = generateAccessToken(user, serviceType);
    const refreshToken = generateRefreshToken(user, serviceType);

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
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

const refreshAccessToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      {
        id: decoded.id,
        serviceType: decoded.serviceType,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
      }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    data: {
      id: req.user.id,
      email: req.user.email,
      serviceType: req.user.serviceType,
    },
  });
};

module.exports = { register, login, refreshAccessToken, getMe };
