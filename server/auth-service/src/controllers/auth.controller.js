const User = require("../models/user.model");
const Service = require("../models/service.model");
const UserService = require("../models/user-service.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const { validateService } = require("../utils/service-validator.util");

// Security constants
const PASSWORD_SALT_ROUNDS = 12;
const TOKEN_EXPIRY = {
  ACCESS: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  REFRESH: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
};
const RATE_LIMIT = {
  LOGIN_ATTEMPTS: 5,
  WINDOW_MINUTES: 15,
};

// Token generation with enhanced security
const generateToken = (payload, secret, expiresIn) => {
  const jwtid = crypto.randomBytes(16).toString("hex");
  return jwt.sign(payload, secret, {
    expiresIn,
    jwtid,
    algorithm: "HS256",
  });
};

const generateAccessToken = (user, serviceSecret) => {
  return generateToken(
    {
      id: user._id,
      email: user.email,
      serviceSecret,
      role: user.role,
    },
    process.env.JWT_SECRET,
    TOKEN_EXPIRY.ACCESS
  );
};

const generateRefreshToken = (user, serviceSecret) => {
  return generateToken(
    {
      id: user._id,
      email: user.email,
      serviceSecret,
    },
    process.env.JWT_REFRESH_SECRET,
    TOKEN_EXPIRY.REFRESH
  );
};

const sanitizeUserInput = (input) => {
  return Object.keys(input).reduce((acc, key) => {
    if (typeof input[key] === "string") {
      acc[key] = input[key].trim();
    } else {
      acc[key] = input[key];
    }
    return acc;
  }, {});
};

const errorResponse = (res, status, message, error = null) => {
  const response = { success: false, message };
  if (error && process.env.NODE_ENV === "development") {
    response.error = error.message;
  }
  return res.status(status).json(response);
};

const AuthController = {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const sanitizedInput = sanitizeUserInput(req.body);
      const {
        email,
        password,
        phone,
        firstName,
        lastName,
        dob,
        serviceSecret,
      } = sanitizedInput;

      console.log("Register input:", {
        email,
        password,
        phone,
        firstName,
        lastName,
        dob,
        serviceSecret,
      }); // Log input

      // Validate password presence and length
      if (!password || password.length < 8) {
        return errorResponse(
          res,
          400,
          "Password must be at least 8 characters"
        );
      }

      // Service verification
      const service = await validateService(serviceSecret);
      if (!service) {
        return errorResponse(res, 403, "Invalid service");
      }

      // Check existing user
      const existingUser = await User.findOne({ email });
      const isNewUser = !existingUser;
      let user = existingUser;

      if (isNewUser) {
        const hashedPassword = await bcrypt.hash(
          password,
          PASSWORD_SALT_ROUNDS
        );
        console.log("Hashed password:", hashedPassword); // Log hashed password
        user = new User({
          email,
          password: hashedPassword,
          phone,
          firstName,
          lastName,
          dob,
          lastPasswordChange: new Date(),
        });
        await user.save();
        console.log("Saved user:", user); // Log saved user
      }

      // Check existing service registration
      const existingUserService = await UserService.findOne({
        user: user._id,
        service: service._id,
      });

      if (existingUserService) {
        return errorResponse(
          res,
          409,
          "User already registered with this service"
        );
      }

      // Create service relationship
      await new UserService({
        user: user._id,
        service: service._id,
      }).save();

      // Generate tokens
      const accessToken = generateAccessToken(user, service.secret);
      const refreshToken = generateRefreshToken(user, service.secret);

      return res.status(201).json({
        success: true,
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
    } catch (error) {
      console.error("Registration error:", error);
      return errorResponse(res, 500, "Registration failed", error);
    }
  },

  async login(req, res) {
    try {
      console.log("Request body:", req.body); // Log input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, serviceSecret } = sanitizeUserInput(req.body);
      console.log("Sanitized input:", { email, password, serviceSecret });

      // Validate password presence
      if (!password) {
        return errorResponse(res, 400, "Password is required");
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse(res, 401, "Invalid credentials");
      }
      console.log("User from DB:", user);

      // Check user password
      if (!user.password) {
        console.error("User password is undefined for email:", email);
        return errorResponse(res, 500, "User account is corrupted");
      }

      // Check account lock
      if (
        user.failedLoginAttempts >= RATE_LIMIT.LOGIN_ATTEMPTS &&
        new Date() < new Date(user.lockUntil)
      ) {
        return errorResponse(res, 429, "Account temporarily locked");
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= RATE_LIMIT.LOGIN_ATTEMPTS) {
          user.lockUntil = new Date(
            Date.now() + RATE_LIMIT.WINDOW_MINUTES * 60 * 1000
          );
        }
        await user.save();
        return errorResponse(res, 401, "Invalid credentials");
      }

      // Reset login attempts
      if (user.failedLoginAttempts > 0 || user.lockUntil) {
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();
      }

      // Verify service
      const service = await validateService(serviceSecret);
      if (!service) {
        return errorResponse(res, 403, "Invalid service code");
      }

      // Check service registration
      const userService = await UserService.findOne({
        user: user._id,
        service: service._id,
      });
      if (!userService) {
        return errorResponse(res, 403, "User not registered with this service");
      }

      // Generate tokens
      const accessToken = generateAccessToken(user, service.secret);
      const refreshToken = generateRefreshToken(user, service.secret);

      return res.json({
        success: true,
        accessToken,
        refreshToken,
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return errorResponse(res, 500, "Login failed", error);
    }
  },

  async refreshAccessToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return errorResponse(res, 401, "Refresh token required");
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Verify user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 404, "User not found");
      }

      // Verify service exists
      const service = await Service.findOne({ secret: decoded.serviceSecret });
      if (!service) {
        return errorResponse(res, 404, "Service not found");
      }

      // Verify service registration
      const userService = await UserService.findOne({
        user: user._id,
        service: service._id,
      });
      if (!userService) {
        return errorResponse(res, 403, "User not registered with this service");
      }

      // Generate new access token
      const accessToken = generateAccessToken(user, service.secret);

      return res.json({
        success: true,
        accessToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      if (error.name === "TokenExpiredError") {
        return errorResponse(res, 401, "Refresh token expired");
      }
      return errorResponse(res, 403, "Invalid refresh token", error);
    }
  },

  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id).select("-password -__v");
      if (!user) {
        return errorResponse(res, 404, "User not found");
      }

      return res.json({
        success: true,
        data: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          dob: user.dob,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      return errorResponse(res, 500, "Error fetching user data", error);
    }
  },
};

module.exports = AuthController;
