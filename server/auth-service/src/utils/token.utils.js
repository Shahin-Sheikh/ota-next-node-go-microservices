const jwt = require("jsonwebtoken");
const {
  jwtSecret,
  jwtRefreshSecret,
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
} = require("../config/jwt.config");
const CustomerUser = require("../models/customer-users.model");
const createServiceUserModel = require("../models/service-user-factory.model");

// Generate JWT token
const generateTokens = (id, userType) => {
  const accessToken = jwt.sign({ id, userType }, jwtSecret, {
    expiresIn: accessTokenExpiresIn,
  });

  const refreshToken = jwt.sign({ id, userType }, jwtRefreshSecret, {
    expiresIn: refreshTokenExpiresIn,
  });

  return { accessToken, refreshToken };
};

// Add refresh token to user
const addRefreshToken = async (
  user,
  refreshToken,
  userType,
  ipAddress = null,
  userAgent = null
) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days

  const UserModel =
    userType === "customer"
      ? CustomerUser
      : createServiceUserModel(user.service);

  // Limit number of active refresh tokens per user (max 5 devices)
  const tokenCount = await UserModel.findById(user._id).select("refreshTokens");
  if (
    tokenCount &&
    tokenCount.refreshTokens &&
    tokenCount.refreshTokens.length >= 5
  ) {
    // Remove oldest token
    await UserModel.findByIdAndUpdate(user._id, {
      $pop: { refreshTokens: -1 },
    });
  }

  await UserModel.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: refreshToken,
        expires,
        ipAddress,
        userAgent,
      },
    },
  });
};

module.exports = {
  generateTokens,
  addRefreshToken,
};
