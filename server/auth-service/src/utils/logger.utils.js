const winston = require("winston");
const path = require("path");

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "auth-service" },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write security events to separate file
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/security.log"),
      level: "warn",
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
});

// If not in production, log to console as well
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Security event logger
const logSecurityEvent = (event, details) => {
  logger.warn("SECURITY_EVENT", {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Authentication attempt logger
const logAuthAttempt = (type, email, success, ip, reason = null) => {
  const logData = {
    type, // 'login', 'register', 'token_refresh', 'logout'
    email,
    success,
    ip,
    timestamp: new Date().toISOString(),
  };

  if (reason) {
    logData.reason = reason;
  }

  if (success) {
    logger.info("AUTH_ATTEMPT", logData);
  } else {
    logger.warn("AUTH_ATTEMPT_FAILED", logData);
  }
};

// Suspicious activity logger
const logSuspiciousActivity = (activity, details) => {
  logger.error("SUSPICIOUS_ACTIVITY", {
    activity,
    details,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  logger,
  logSecurityEvent,
  logAuthAttempt,
  logSuspiciousActivity,
};
