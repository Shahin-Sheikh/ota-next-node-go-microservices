const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateServiceSecret } = require("../middlewares/service.middleware");

// Customer routes
router.post("/customer/register", authController.registerCustomer);
router.post("/customer/login", authController.loginCustomer);

// Service routes
router.post(
  "/service/register",
  validateServiceSecret,
  authController.registerServiceUser
);
router.post(
  "/service/login",
  validateServiceSecret,
  authController.loginServiceUser
);

// Token routes
router.post("/token/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

// Service initialization
router.post("/service/init", authController.initializeService);

module.exports = router;
