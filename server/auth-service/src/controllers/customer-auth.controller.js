const CustomerUser = require("../models/customer-users.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");

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
