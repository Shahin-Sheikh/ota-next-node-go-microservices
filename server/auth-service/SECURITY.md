# Authentication Service - Security Implementation

## Overview

This authentication service implements enterprise-grade security features for a microservices architecture with comprehensive protection against common vulnerabilities.

## Security Features Implemented

### 1. **Input Validation & Sanitization**

- ✅ Express-validator for comprehensive input validation
- ✅ Email format validation and normalization
- ✅ Strong password requirements (min 8 chars, uppercase, lowercase, number, special character)
- ✅ Password strength checking against common weak passwords
- ✅ Name and field sanitization with XSS prevention
- ✅ JWT format validation

### 2. **Rate Limiting**

- ✅ General API rate limiting (100 requests per 15 minutes)
- ✅ Strict authentication rate limiting (5 attempts per 15 minutes)
- ✅ Token refresh rate limiting (10 requests per 15 minutes)
- ✅ Service registration rate limiting (3 attempts per hour)
- ✅ IP-based tracking with configurable limits

### 3. **Account Security**

- ✅ Account lockout after 5 failed login attempts (2 hours)
- ✅ Automatic lock expiration and attempt reset
- ✅ Login attempt tracking per user
- ✅ Last login timestamp and IP tracking
- ✅ Password change detection for token invalidation

### 4. **Token Management**

- ✅ JWT access tokens (15 minutes expiration)
- ✅ Refresh tokens with rotation (7 days expiration)
- ✅ Maximum 5 active refresh tokens per user (device limit)
- ✅ Token reuse detection with automatic session termination
- ✅ IP address and user agent tracking per token
- ✅ Automatic removal of oldest tokens when limit exceeded
- ✅ Token invalidation after password change

### 5. **Data Protection**

- ✅ NoSQL injection prevention (express-mongo-sanitize)
- ✅ XSS protection (removed xss-clean as deprecated, using input validation instead)
- ✅ HTTP Parameter Pollution (HPP) prevention
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Sensitive data excluded from responses
- ✅ Request body size limits (10kb)

### 6. **HTTP Security Headers**

- ✅ Helmet.js for security headers
- ✅ Content Security Policy (CSP)
- ✅ HTTP Strict Transport Security (HSTS)
- ✅ X-Frame-Options protection
- ✅ X-Content-Type-Options nosniff
- ✅ CORS configuration with allowed origins

### 7. **Logging & Monitoring**

- ✅ Winston logger with multiple transports
- ✅ Separate logs for errors, combined events, and security events
- ✅ Authentication attempt logging (success/failure)
- ✅ Security event logging (token reuse, invalid attempts)
- ✅ Suspicious activity tracking
- ✅ Log rotation with size limits (5MB per file, 5-10 files retained)
- ✅ IP address and timestamp tracking

### 8. **API Documentation**

- ✅ Swagger/OpenAPI 3.0 documentation
- ✅ Complete endpoint documentation with examples
- ✅ Request/response schemas
- ✅ Authentication scheme documentation
- ✅ Interactive API testing interface
- ✅ Available at `/api-docs`

### 9. **Service-to-Service Authentication**

- ✅ Service secret validation with bcrypt
- ✅ Service registry for multiple microservices
- ✅ Domain-based access control (allowedDomains)
- ✅ Service initialization with secure secret storage

### 10. **Error Handling**

- ✅ Consistent error response format
- ✅ Development vs production error details
- ✅ Graceful error handling without information leakage
- ✅ Global error handler with logging
- ✅ 404 handler for undefined routes

### 11. **Additional Security Measures**

- ✅ Trust proxy configuration for accurate IP detection
- ✅ Cookie parser for secure cookie handling
- ✅ Graceful shutdown handling
- ✅ Unhandled rejection handling
- ✅ Environment-based configuration
- ✅ MongoDB connection security

## API Endpoints

### Customer Authentication

- `POST /api/auth/customer/register` - Register new customer
- `POST /api/auth/customer/login` - Customer login

### Service Authentication

- `POST /api/auth/service/register` - Register service user (requires service-secret header)
- `POST /api/auth/service/login` - Service user login (requires service-secret header)

### Token Management

- `POST /api/auth/token/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke refresh token

### Service Management

- `POST /api/auth/service/init` - Initialize new service (one-time setup)

### Health & Documentation

- `GET /health` - Health check endpoint
- `GET /api-docs` - Swagger UI documentation
- `GET /api-docs.json` - OpenAPI JSON specification

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# JWT Secrets (use strong random strings)
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info
```

## Security Best Practices Implemented

1. **Password Security**

   - Minimum 8 characters with complexity requirements
   - Bcrypt hashing with 12 rounds
   - Password change timestamp tracking
   - Weak password detection

2. **Token Security**

   - Short-lived access tokens (15 minutes)
   - Rotating refresh tokens
   - Token family detection for reuse attacks
   - Device/session limits per user

3. **Brute Force Protection**

   - Rate limiting on all endpoints
   - Account lockout mechanism
   - IP-based tracking
   - Configurable limits

4. **Data Validation**

   - Comprehensive input validation
   - Email normalization
   - SQL/NoSQL injection prevention
   - XSS protection through sanitization

5. **Monitoring**

   - Detailed security event logging
   - Failed authentication tracking
   - Suspicious activity detection
   - Audit trails with IP addresses

6. **Defense in Depth**
   - Multiple layers of security controls
   - No single point of failure
   - Secure defaults
   - Principle of least privilege

## Testing the API

1. **Start the service:**

   ```bash
   npm run dev
   ```

2. **Access Swagger documentation:**

   - Open browser to `http://localhost:3000/api-docs`

3. **Initialize a service:**

   ```bash
   curl -X POST http://localhost:3000/api/auth/service/init \
     -H "Content-Type: application/json" \
     -d '{
       "serviceName": "admin",
       "serviceSecret": "your-secure-secret-key",
       "allowedDomains": ["admin.example.com"]
     }'
   ```

4. **Register a customer:**

   ```bash
   curl -X POST http://localhost:3000/api/auth/customer/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!",
       "name": "John Doe"
     }'
   ```

5. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/customer/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!"
     }'
   ```

## Security Recommendations

1. **Secrets Management**

   - Use environment variables for all secrets
   - Never commit `.env` files to version control
   - Rotate JWT secrets regularly
   - Use strong, random secrets (min 64 characters)

2. **Production Deployment**

   - Set `NODE_ENV=production`
   - Use HTTPS only
   - Configure proper CORS origins
   - Enable all security headers
   - Set up proper log rotation
   - Monitor security logs regularly

3. **Database Security**

   - Use MongoDB Atlas with IP whitelisting
   - Enable authentication
   - Use connection pooling
   - Regular backups

4. **Additional Measures to Consider**
   - Implement 2FA for sensitive operations
   - Add email verification for new accounts
   - Implement password reset functionality
   - Add CAPTCHA for repeated failed attempts
   - Set up real-time alerting for security events
   - Implement session management dashboard
   - Add geolocation-based suspicious activity detection

## Logging

Logs are stored in the `logs/` directory:

- `error.log` - Error-level events
- `combined.log` - All log events
- `security.log` - Security-related events

Log files rotate automatically when they reach 5MB.

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT implementation
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **express-mongo-sanitize** - NoSQL injection prevention
- **hpp** - HTTP parameter pollution prevention
- **helmet** - Security headers
- **cors** - CORS handling
- **winston** - Logging
- **swagger-ui-express** - API documentation
- **swagger-jsdoc** - Swagger spec generation
- **cookie-parser** - Cookie handling
- **dotenv** - Environment configuration

## Maintenance

1. **Regular Updates**

   - Keep all dependencies updated
   - Monitor security advisories
   - Run `npm audit` regularly

2. **Log Monitoring**

   - Review security logs daily
   - Set up alerts for suspicious activities
   - Archive old logs regularly

3. **Security Testing**
   - Regular penetration testing
   - Automated security scanning
   - Review authentication flows

## License

MIT
