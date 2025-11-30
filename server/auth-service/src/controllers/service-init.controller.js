const bcrypt = require("bcryptjs");
const ServiceRegistry = require("../models/service-registry.model");
const createServiceUserModel = require("../models/service-user-factory.model");
const { logSecurityEvent } = require("../utils/logger.utils");

/**
 * @swagger
 * /api/auth/service/init:
 *   post:
 *     summary: Initialize a new service (one-time setup)
 *     tags: [Service Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - serviceSecret
 *             properties:
 *               serviceName:
 *                 type: string
 *                 enum: [admin, hotel, crm]
 *                 example: admin
 *               serviceSecret:
 *                 type: string
 *                 format: password
 *                 example: your-secure-service-secret-key
 *               allowedDomains:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["admin.example.com", "api.example.com"]
 *     responses:
 *       201:
 *         description: Service initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     serviceName:
 *                       type: string
 *                     allowedDomains:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid service name or service already exists
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
// Initialize service (one-time setup)
exports.initializeService = async (req, res) => {
  try {
    const { serviceName, serviceSecret, allowedDomains } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    if (!["admin", "hotel", "crm"].includes(serviceName)) {
      logSecurityEvent("invalid_service_init", {
        serviceName,
        ipAddress,
      });
      return res.status(400).json({
        success: false,
        message: "Invalid service name. Allowed: admin, hotel, crm",
      });
    }

    const existingService = await ServiceRegistry.findOne({ serviceName });
    if (existingService) {
      logSecurityEvent("duplicate_service_init", {
        serviceName,
        ipAddress,
      });
      return res.status(400).json({
        success: false,
        message: "Service already initialized",
      });
    }

    const hashedSecret = await bcrypt.hash(serviceSecret, 12);

    const service = await ServiceRegistry.create({
      serviceName,
      serviceSecret: hashedSecret,
      allowedDomains: allowedDomains || [],
    });

    // Create the collection by initializing the model
    createServiceUserModel(serviceName);

    logSecurityEvent("service_initialized", {
      serviceName,
      ipAddress,
      serviceId: service._id,
    });

    res.status(201).json({
      success: true,
      data: {
        id: service._id,
        serviceName: service.serviceName,
        allowedDomains: service.allowedDomains,
      },
    });
  } catch (err) {
    logSecurityEvent("service_init_error", {
      error: err.message,
      ipAddress: req.ip || req.connection.remoteAddress,
    });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
