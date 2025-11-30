const { body, validationResult } = require("express-validator");
const validator = require("validator");

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Customer registration validation
const validateCustomerRegister = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .custom((value) => {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email format");
      }
      return true;
    }),
  body("password")
    .trim()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .custom((value) => {
      // Check for common weak passwords
      const weakPasswords = [
        "password",
        "12345678",
        "password123",
        "qwerty123",
      ];
      if (
        weakPasswords.some((weak) =>
          value.toLowerCase().includes(weak.toLowerCase())
        )
      ) {
        throw new Error("Password is too common or weak");
      }
      return true;
    }),
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .escape(),
  handleValidationErrors,
];

// Customer login validation
const validateCustomerLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Invalid password format"),
  handleValidationErrors,
];

// Service user registration validation
const validateServiceUserRegister = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .escape(),
  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .escape(),
  body("agentId")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Agent ID must not exceed 50 characters")
    .escape(),
  handleValidationErrors,
];

// Service user login validation
const validateServiceUserLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 128 })
    .withMessage("Invalid password format"),
  handleValidationErrors,
];

// Refresh token validation
const validateRefreshToken = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required")
    .isJWT()
    .withMessage("Invalid refresh token format"),
  handleValidationErrors,
];

// Logout validation
const validateLogout = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required")
    .isJWT()
    .withMessage("Invalid refresh token format"),
  handleValidationErrors,
];

// Service initialization validation
const validateServiceInit = [
  body("serviceName")
    .trim()
    .notEmpty()
    .withMessage("Service name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Service name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9-_]+$/)
    .withMessage(
      "Service name can only contain letters, numbers, hyphens, and underscores"
    )
    .escape(),
  body("allowedDomains")
    .optional()
    .isArray()
    .withMessage("Allowed domains must be an array"),
  body("allowedDomains.*")
    .optional()
    .trim()
    .custom((value) => {
      if (!validator.isFQDN(value) && !validator.isIP(value)) {
        throw new Error("Each domain must be a valid FQDN or IP address");
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateCustomerRegister,
  validateCustomerLogin,
  validateServiceUserRegister,
  validateServiceUserLogin,
  validateRefreshToken,
  validateLogout,
  validateServiceInit,
};
