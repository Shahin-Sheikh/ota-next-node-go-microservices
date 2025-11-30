const jwt = require("jsonwebtoken");
const { jwtRefreshSecret } = require("../config/jwt.config");
const CustomerUser = require("../models/customer-users.model");
const createServiceUserModel = require("../models/service-user-factory.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");
const { logAuthAttempt, logSecurityEvent } = require("../utils/logger.utils");

/**
 * @swagger
 * /api/auth/token/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Token Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenRefreshResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

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
    }).select("+passwordChangedAt");

    if (!user) {
      logSecurityEvent("invalid_refresh_token", {
        userId: decoded.id,
        ipAddress,
      });
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter && user.changedPasswordAfter(decoded.iat)) {
      logSecurityEvent("token_after_password_change", {
        userId: user._id,
        ipAddress,
      });
      return res.status(401).json({
        success: false,
        message: "Password was recently changed. Please login again.",
      });
    }

    // Detect token reuse (possible attack)
    const tokenData = user.refreshTokens.find((t) => t.token === refreshToken);
    if (tokenData && tokenData.ipAddress && tokenData.ipAddress !== ipAddress) {
      logSecurityEvent("token_reuse_detected", {
        userId: user._id,
        originalIp: tokenData.ipAddress,
        currentIp: ipAddress,
      });
      // Revoke all refresh tokens for this user
      await UserModel.findByIdAndUpdate(user._id, {
        $set: { refreshTokens: [] },
      });
      return res.status(401).json({
        success: false,
        message:
          "Security violation detected. All sessions have been terminated. Please login again.",
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
    await addRefreshToken(
      user,
      newRefreshToken,
      decoded.userType,
      ipAddress,
      userAgent
    );

    logAuthAttempt("token_refresh", user.email || user._id, true, ipAddress);

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
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Token Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         description: Refresh token is required
 *       500:
 *         description: Server error
 */
// Logout endpoint
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

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

    logAuthAttempt("logout", decoded.id, true, ipAddress);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
