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
const addRefreshToken = async (user, refreshToken, userType) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days

  const UserModel =
    userType === "customer"
      ? CustomerUser
      : createServiceUserModel(user.service);

  await UserModel.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: refreshToken,
        expires,
      },
    },
  });
};

module.exports = {
  generateTokens,
  addRefreshToken,
};
