const User = require("../models/user.model");
const Service = require("../models/service.model"); // assumes you have a separate collection for services
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user, serviceCode) => {
  return jwt.sign(
    { id: user._id, email: user.email, serviceCode },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
};

const generateRefreshToken = (user, serviceCode) => {
  return jwt.sign(
    {
      id: user._id,
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
  try {
    const { email, password, phone, firstName, lastName, dob, serviceSecret } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const service = await Service.findOne({ secret: serviceSecret });
    if (!service) {
      return res.status(403).json({ message: "Invalid service secret" });
    }

    const user = new User({
      email,
      password,
      phone,
      firstName,
      lastName,
      dob,
      serviceSecret,
    });

    await user.save();

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
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

// Login controller
const login = async (req, res) => {
  const { email, password, serviceSecret } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const service = await Service.findOne({ secret: serviceSecret });
    if (!service) {
      return res.status(403).json({ message: "Invalid service secret" });
    }

    // Validate if this user belongs to the given service
    if (user.serviceSecret !== serviceSecret) {
      return res.status(403).json({ message: "Unauthorized for this service" });
    }

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
        serviceCode: decoded.serviceCode,
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
      serviceCode: req.user.serviceCode,
    },
  });
};

module.exports = { register, login, refreshAccessToken, getMe };
