# Swagger API Documentation - All Services

## Overview

All Node.js services now have Swagger/OpenAPI 3.0 documentation with interactive testing capabilities.

## Service Documentation URLs

### 🔐 Auth Service (PORT: 5001)

- **Swagger UI**: http://localhost:5001/api-docs
- **OpenAPI JSON**: http://localhost:5001/api-docs.json
- **Base URL**: http://localhost:5001/api/auth

**Features:**

- Customer registration & login
- Service user authentication
- Token refresh & logout
- Service initialization
- JWT token management
- Rate limiting & security features

---

### 👤 Customer Service (PORT: 5002)

- **Swagger UI**: http://localhost:5002/api-docs
- **OpenAPI JSON**: http://localhost:5002/api-docs.json
- **Base URL**: http://localhost:5002/api/customers

**Features:**

- Customer profile management
- Booking management
- Search functionality
- JWT authentication required

---

### 🏨 Hotel Service (PORT: 5003)

- **Swagger UI**: http://localhost:5003/api-docs
- **OpenAPI JSON**: http://localhost:5003/api-docs.json
- **Base URL**: http://localhost:5003/api/hotels

**Features:**

- Hotel management
- Room inventory
- Booking operations
- JWT authentication required

---

## Quick Start Guide

### 1. Start All Services

```bash
# Terminal 1 - Auth Service
cd server/auth-service
npm run dev

# Terminal 2 - Customer Service
cd server/customer-service
npm run dev

# Terminal 3 - Hotel Service
cd server/hotel-service
npm run dev
```

### 2. Access Swagger Documentation

Open your browser and navigate to:

- Auth Service: http://localhost:5001/api-docs
- Customer Service: http://localhost:5002/api-docs
- Hotel Service: http://localhost:5003/api-docs

### 3. Authenticate in Swagger

**Step 1: Register/Login** (Auth Service)

1. Go to http://localhost:5001/api-docs
2. Use `POST /api/auth/customer/register` to create an account
3. Or use `POST /api/auth/customer/login` to login
4. Copy the `accessToken` from the response

**Step 2: Authorize in Swagger**

1. Click the **"Authorize"** button (🔓 icon) at the top right
2. Paste your access token in the "Value" field
3. Click "Authorize" then "Close"
4. Now you can test protected endpoints!

---

## Common Features Across All Services

### ✅ Security Features

- ✅ **CORS Protection** - Configured for frontend origins
- ✅ **Helmet.js** - Security headers
- ✅ **Rate Limiting** - Prevent abuse (Auth Service)
- ✅ **JWT Authentication** - Bearer token validation
- ✅ **Request Size Limits** - 10kb max body size
- ✅ **Input Validation** - Comprehensive validation (Auth Service)

### ✅ Documentation Features

- ✅ **Interactive Testing** - Try endpoints directly in browser
- ✅ **Request/Response Examples** - See sample data
- ✅ **Schema Definitions** - Clear data models
- ✅ **Authentication Support** - Built-in Bearer token handling
- ✅ **Error Examples** - See possible error responses
- ✅ **Persistent Authorization** - Token saved in session

### ✅ Development Features

- ✅ **Health Check Endpoints** - `/health` on all services
- ✅ **Graceful Shutdown** - Proper cleanup on exit
- ✅ **Environment-based Config** - Development/production modes
- ✅ **Logging** - Morgan for HTTP request logging
- ✅ **Error Handling** - Consistent error responses

---

## Testing Workflow Example

### Example: Create a booking flow

1. **Register a customer** (Auth Service)

   ```
   POST http://localhost:5001/api/auth/customer/register
   {
     "email": "john@example.com",
     "password": "SecurePass123!",
     "name": "John Doe"
   }
   ```

   → Get `accessToken`

2. **Get hotels list** (Hotel Service - with token)

   ```
   GET http://localhost:5003/api/hotels
   Authorization: Bearer <your_access_token>
   ```

3. **Search/filter hotels** (Customer Service - with token)

   ```
   GET http://localhost:5002/api/customers/search?city=NewYork
   Authorization: Bearer <your_access_token>
   ```

4. **Create booking** (Hotel/Customer Service - with token)
   ```
   POST http://localhost:5003/api/hotels/{hotelId}/bookings
   Authorization: Bearer <your_access_token>
   ```

---

## Environment Variables

### All Services Require:

```bash
# Port configuration
PORT=<service_port>

# Environment
NODE_ENV=development

# JWT Secrets (MUST be same across all services)
JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_refresh_secret>

# CORS origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

---

## Swagger UI Features

### 🎯 Key Features:

1. **Try it out** - Execute requests directly from browser
2. **Authorize** - Add JWT token once, use everywhere
3. **Examples** - See request/response samples
4. **Schema** - View data models and required fields
5. **Export** - Download OpenAPI spec as JSON
6. **Search** - Find endpoints quickly
7. **Persist** - Authorization persists across page reloads

### 🎨 UI Customization:

- Clean interface (no topbar clutter)
- Service-specific branding
- Dark/light theme support
- Collapsible sections
- Copy-to-clipboard for examples

---

## API Standards

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <access_token>
```

### Success Response Format

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful"
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

---

## Troubleshooting

### Issue: "Failed to fetch" in Swagger

**Solution**:

- Check if service is running
- Verify CORS configuration in .env
- Ensure PORT matches in swagger.config.js

### Issue: "401 Unauthorized"

**Solution**:

- Get fresh token from auth service
- Click "Authorize" and paste token
- Ensure token hasn't expired (15 minutes)

### Issue: "CORS Error"

**Solution**:

- Add your origin to ALLOWED_ORIGINS in .env
- Restart the service
- Clear browser cache

### Issue: Rate Limited (Auth Service)

**Solution**:

- Wait for rate limit window to expire
- Use different endpoint
- Adjust rate limits in development

---

## Production Deployment

### Before Going Live:

1. **Security**

   - ✅ Set `NODE_ENV=production`
   - ✅ Use strong JWT secrets (64+ chars)
   - ✅ Enable HTTPS only
   - ✅ Restrict CORS to production domains
   - ✅ Enable all rate limits
   - ✅ Remove or restrict Swagger in production

2. **Documentation**

   - ✅ Consider password-protecting Swagger
   - ✅ Host on separate subdomain (docs.api.com)
   - ✅ Update server URLs in swagger.config.js
   - ✅ Add production examples

3. **Monitoring**
   - ✅ Set up error tracking
   - ✅ Monitor API usage
   - ✅ Track response times
   - ✅ Alert on failures

---

## Service Dependencies

```
┌─────────────────┐
│  Auth Service   │ ← Creates JWT tokens
│   PORT: 5001    │
└────────┬────────┘
         │
         │ JWT Tokens
         │
    ┌────┴──────────────────┐
    │                       │
    v                       v
┌────────────┐      ┌──────────────┐
│  Customer  │      │    Hotel     │
│  Service   │ ←───→│   Service    │
│ PORT: 5002 │      │  PORT: 5003  │
└────────────┘      └──────────────┘
     │                      │
     │                      │
     v                      v
┌────────────┐      ┌──────────────┐
│  SQL Server│      │  PostgreSQL  │
│  Database  │      │   Database   │
└────────────┘      └──────────────┘
```

---

## Next Steps

1. **Add More Endpoints** - Document all routes in controllers
2. **Add Request Examples** - Include sample payloads
3. **Add Response Examples** - Show success/error cases
4. **Create Postman Collection** - Export from Swagger
5. **Write Integration Tests** - Use Swagger spec for testing
6. **Add API Versioning** - /api/v1, /api/v2
7. **Implement API Gateway** - Centralize all services

---

## Resources

- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **Express Middleware**: https://expressjs.com/en/guide/using-middleware.html
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

## Support

For issues or questions:

- Check service logs
- Verify environment variables
- Test with Postman first
- Review Swagger documentation
- Check network/CORS settings

---

**All services are now fully documented with Swagger! 🎉**

Access the documentation:

- 🔐 Auth: http://localhost:5001/api-docs
- 👤 Customer: http://localhost:5002/api-docs
- 🏨 Hotel: http://localhost:5003/api-docs
