const CustomerUser = require("../models/customer-users.model");
const { generateTokens, addRefreshToken } = require("../utils/token.utils");
const {
  logAuthAttempt,
  logSuspiciousActivity,
} = require("../utils/logger.utils");

/**
 * @swagger
 * /api/auth/customer/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Customer Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: SecurePass123!
 *                 description: Must contain uppercase, lowercase, number, and special character
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Customer registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
// Customer registration
exports.registerCustomer = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const existingUser = await CustomerUser.findOne({ email });
    if (existingUser) {
      logAuthAttempt(
        "register",
        email,
        false,
        ipAddress,
        "Email already exists"
      );
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const user = await CustomerUser.create({ email, password, name });
    const { accessToken, refreshToken } = generateTokens(user._id, "customer");

    await addRefreshToken(user, refreshToken, "customer", ipAddress, userAgent);

    logAuthAttempt("register", email, true, ipAddress);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    logSuspiciousActivity("registration_error", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/**
 * @swagger
 * /api/auth/customer/login:
 *   post:
 *     summary: Login as a customer
 *     tags: [Customer Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or account locked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
// Customer login
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const user = await CustomerUser.findOne({ email }).select(
      "+password +lockUntil"
    );

    if (!user) {
      logAuthAttempt("login", email, false, ipAddress, "User not found");
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      logAuthAttempt("login", email, false, ipAddress, "Account locked");
      return res.status(401).json({
        success: false,
        message:
          "Account is temporarily locked due to multiple failed login attempts. Please try again later.",
      });
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      await user.incLoginAttempts();
      logAuthAttempt("login", email, false, ipAddress, "Invalid password");

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();
    await CustomerUser.findByIdAndUpdate(user._id, {
      lastLogin: Date.now(),
      lastLoginIp: ipAddress,
    });

    const { accessToken, refreshToken } = generateTokens(user._id, "customer");
    await addRefreshToken(user, refreshToken, "customer", ipAddress, userAgent);

    logAuthAttempt("login", email, true, ipAddress);

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    logSuspiciousActivity("login_error", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
