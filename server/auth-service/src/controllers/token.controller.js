const jwt = require("jsonwebtoken");
const { jwtRefreshSecret } = require("../config/jwt.config");
const CustomerUser = require("../models/customer-users.model");
const createServiceUserModel = require("../models/service-user-factory.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");

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

    const UserModel =
      decoded.userType === "customer"
        ? CustomerUser
        : createServiceUserModel(decoded.service);

    const user = await UserModel.findOne({
      _id: decoded.id,
      "refreshTokens.token": refreshToken,
      "refreshTokens.expires": { $gt: new Date() },
    });

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
    await UserModel.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
    await addRefreshToken(user, newRefreshToken, decoded.userType);

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

    const UserModel =
      decoded.userType === "customer"
        ? CustomerUser
        : createServiceUserModel(decoded.service);

    await UserModel.updateOne(
      { _id: decoded.id },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );

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
