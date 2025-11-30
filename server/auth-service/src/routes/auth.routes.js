const express = require("express");
const router = express.Router();
const authController = require("../controllers/index");
const { validateServiceSecret } = require("../middlewares/service.middleware");
const {
  validateCustomerRegister,
  validateCustomerLogin,
  validateServiceUserRegister,
  validateServiceUserLogin,
  validateRefreshToken,
  validateLogout,
  validateServiceInit,
} = require("../middlewares/validation.middleware");
const {
  authLimiter,
  tokenRefreshLimiter,
  serviceRegistrationLimiter,
} = require("../middlewares/rate-limiter.middleware");

// Customer routes
router.post(
  "/customer/register",
  authLimiter,
  validateCustomerRegister,
  authController.registerCustomer
);

router.post(
  "/customer/login",
  authLimiter,
  validateCustomerLogin,
  authController.loginCustomer
);

// Service routes
router.post(
  "/service/register",
  serviceRegistrationLimiter,
  validateServiceSecret,
  validateServiceUserRegister,
  authController.registerServiceUser
);

router.post(
  "/service/login",
  authLimiter,
  validateServiceSecret,
  validateServiceUserLogin,
  authController.loginServiceUser
);

// Token routes
router.post(
  "/token/refresh",
  tokenRefreshLimiter,
  validateRefreshToken,
  authController.refreshToken
);

router.post("/logout", validateLogout, authController.logout);

// Service initialization
router.post(
  "/service/init",
  serviceRegistrationLimiter,
  validateServiceInit,
  authController.initializeService
);

module.exports = router;
