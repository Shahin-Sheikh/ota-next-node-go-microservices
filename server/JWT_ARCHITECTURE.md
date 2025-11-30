# JWT Authentication Architecture

## Overview

This microservices system uses a centralized authentication service with distributed token verification.

## How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────>│ Auth Service │────>│   Database   │
│  (Frontend)  │     │  PORT: 3000  │     │   MongoDB    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │
       │ 1. Login Request    │
       │────────────────────>│
       │                     │ 2. Validate & Create Tokens
       │                     │    - Access Token (15m)
       │                     │    - Refresh Token (7d)
       │                     │
       │ 3. Return Tokens    │
       │<────────────────────│
       │                     │
       │ 4. Request with     │
       │    Access Token     │
       ├────────────────────────────────>┌──────────────┐
       │                                  │Hotel Service │
       │                                  │ PORT: 5003   │
       │                                  └──────────────┘
       │                                         │
       │                                         │ 5. Verify Token
       │                                         │    (Using Same Secret)
       │                                         │
       │ 6. Response                             │
       │<────────────────────────────────────────│
```

## JWT Secrets Configuration

### **JWT_SECRET** (Access Token Secret)

- **Purpose**: Signs and verifies short-lived access tokens
- **Lifespan**: 15 minutes (configurable)
- **Usage**: Included in every API request via Authorization header
- **Format**: `Bearer <access_token>`

### **JWT_REFRESH_SECRET** (Refresh Token Secret)

- **Purpose**: Signs and verifies long-lived refresh tokens
- **Lifespan**: 7 days (configurable)
- **Usage**: Used to obtain new access tokens without re-login
- **Storage**: Should be stored securely (httpOnly cookies recommended)

## Why All Services Need the Same Secrets?

### ✅ **Correct Approach** (Current Implementation)

```
Auth Service (Creates Token)     Other Services (Verify Token)
     └─── Same JWT_SECRET ───────────┘
```

**Benefits:**

1. **Stateless Authentication** - No need to call auth service for every request
2. **Fast Verification** - Services verify tokens independently
3. **Scalability** - No single point of failure for token verification
4. **Performance** - No network calls for authentication

### ❌ **Wrong Approach** (What NOT to do)

```
Auth Service (Different Secret) → Other Services (Different Secret)
     └─── Token verification fails! ───────┘
```

## Security Best Practices

### 1. **Environment-Specific Secrets**

```bash
# Development
JWT_SECRET=dev_secret_key

# Production
JWT_SECRET=<256-bit cryptographically secure random string>
```

### 2. **Secret Management**

- ✅ Use **environment variables** (current)
- ✅ Use **secret management services** (AWS Secrets Manager, HashiCorp Vault)
- ❌ Never commit secrets to version control
- ❌ Never hardcode secrets in code

### 3. **Token Rotation**

- Refresh tokens are rotated on each use (implemented)
- Old refresh tokens are invalidated after use
- Detects token reuse attacks (implemented)

### 4. **Token Payload**

```javascript
// Access Token Payload
{
  "id": "user_id",
  "userType": "customer" | "service_name",
  "iat": 1234567890,  // Issued at
  "exp": 1234568790   // Expires at
}
```

## Service-Specific Configuration

### **Auth Service (PORT: 3000)**

- **Role**: Token creation and management
- **Responsibilities**:
  - User registration/login
  - Token generation
  - Token refresh
  - Token revocation (logout)
  - Password management

### **Hotel Service (PORT: 5003)**

- **Role**: Token verification only
- **Responsibilities**:
  - Verify incoming access tokens
  - Extract user information from token
  - Authorize based on user type/role

### **Customer Service (PORT: 5002)**

- **Role**: Token verification only
- **Responsibilities**:
  - Verify incoming access tokens
  - Extract user information from token
  - Authorize based on user type/role

### **Admin/CRM Services**

- **Role**: Token verification only
- **Responsibilities**:
  - Verify incoming access tokens
  - Extract user information from token
  - Authorize based on service permissions

## Implementation Example

### Auth Service (Creates Token)

```javascript
// Generate tokens
const accessToken = jwt.sign(
  { id: user._id, userType: "customer" },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
);

const refreshToken = jwt.sign(
  { id: user._id, userType: "customer" },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
);
```

### Other Services (Verify Token)

```javascript
// Middleware to verify token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

## Token Lifecycle

### 1. **Initial Authentication**

```
User Login → Auth Service → Generate Tokens → Return to Client
```

### 2. **API Request**

```
Client → [Access Token] → Service → Verify Token → Process Request
```

### 3. **Token Expiry**

```
Access Token Expires → Client → [Refresh Token] → Auth Service
→ Generate New Tokens → Return to Client
```

### 4. **Logout**

```
Client → [Refresh Token] → Auth Service → Revoke Token → Confirm Logout
```

## Security Features Implemented

✅ **Token Rotation** - Refresh tokens are rotated on each use
✅ **Token Reuse Detection** - Detects and blocks token replay attacks
✅ **Account Lockout** - Locks accounts after 5 failed login attempts
✅ **Password Change Detection** - Invalidates tokens after password change
✅ **IP Tracking** - Logs IP addresses for security monitoring
✅ **Device Limiting** - Max 5 active refresh tokens per user
✅ **Rate Limiting** - Prevents brute force attacks
✅ **Input Validation** - Validates all inputs with express-validator
✅ **Security Logging** - Logs all authentication events

## Environment Variables Setup

### Required in ALL Services:

```bash
# Same secrets across all services
JWT_SECRET=<your-256-bit-secret>
JWT_REFRESH_SECRET=<your-256-bit-refresh-secret>

# Service-specific
PORT=<service-port>
NODE_ENV=development|production
```

### Generate Secure Secrets:

```bash
# Generate JWT_SECRET (256 bits)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET (256 bits)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Common Issues & Solutions

### Issue 1: "Invalid Token" Error

**Cause**: Different JWT secrets between services
**Solution**: Ensure all services use the same JWT_SECRET

### Issue 2: Token Expired Too Quickly

**Cause**: Short ACCESS_TOKEN_EXPIRES_IN value
**Solution**: Increase to 15m-1h, use refresh tokens for extended sessions

### Issue 3: Refresh Token Not Working

**Cause**: Different JWT_REFRESH_SECRET or token revoked
**Solution**: Verify JWT_REFRESH_SECRET is consistent, check if token was revoked

### Issue 4: Unauthorized After Password Change

**Cause**: Security feature - tokens invalidated after password change
**Solution**: Expected behavior - user must re-login

## API Gateway Pattern (Recommended)

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │
      v
┌────────────────┐
│  API Gateway   │ ← Single entry point
│   (Port 80)    │ ← Token verification here
└────────┬───────┘
         │
    ┌────┴────┬─────────┬──────────┐
    v         v         v          v
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Auth  │ │ Hotel  │ │Customer│ │  CRM   │
│Service │ │Service │ │Service │ │Service │
└────────┘ └────────┘ └────────┘ └────────┘
```

**Benefits:**

- Centralized authentication
- Single SSL/TLS termination
- Rate limiting at gateway level
- Simplified client configuration

## Monitoring & Logging

### Security Events Logged:

- ✅ Login attempts (success/failure)
- ✅ Token refresh requests
- ✅ Token reuse detection
- ✅ Account lockouts
- ✅ Password changes
- ✅ Suspicious activities
- ✅ Service initialization

### Log Files:

- `logs/error.log` - Error events
- `logs/combined.log` - All events
- `logs/security.log` - Security-specific events

## Testing

### Test Token Generation:

```bash
POST http://localhost:3000/api/auth/customer/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "YourPassword123!"
}
```

### Test Token Verification:

```bash
GET http://localhost:5003/api/hotels
Authorization: Bearer <your_access_token>
```

### Test Token Refresh:

```bash
POST http://localhost:3000/api/auth/token/refresh
Content-Type: application/json

{
  "refreshToken": "<your_refresh_token>"
}
```

## Conclusion

The JWT secrets are **shared intentionally** across all services to enable:

- **Decentralized token verification**
- **Stateless authentication**
- **High performance**
- **Scalability**

All services can independently verify tokens without calling the auth service, while maintaining a secure, centralized authentication system.
