# Admin Service - Clean Architecture

This is a world-class clean architecture implementation of the Admin Service for the OTA (Online Travel Agency) microservices system.

## 🏗️ Architecture

The project follows Clean Architecture principles with the following layers:

### Domain Layer (`Domain/`)

- **Entities**: Core business entities (AdminUser, Hotel, Room, etc.)
- **Repositories**: Repository interfaces
- **Exceptions**: Domain-specific exceptions
- **Common**: Base classes and interfaces

### Application Layer (`Application/`)

- **Services**: Business logic and use cases
- **DTOs**: Data transfer objects
- **Interfaces**: Service contracts
- **Validators**: Input validation using FluentValidation
- **Mappings**: AutoMapper profiles

### Infrastructure Layer (`Infrastructure/`)

- **Data**: Entity Framework Core DbContext
- **Repositories**: Repository implementations
- **Services**: External service implementations
- **Configuration**: Settings and configuration classes

### API Layer (`Api/`)

- **Controllers**: REST API endpoints
- **Middleware**: Custom middleware components

## 🚀 Features

- **Clean Architecture**: Separation of concerns with clear layer boundaries
- **PostgreSQL Database**: Robust relational database with Entity Framework Core
- **JWT Authentication**: Secure authentication and authorization
- **Role-Based Access Control**: SuperAdmin, Admin, Manager roles
- **Input Validation**: Comprehensive validation using FluentValidation
- **Audit Logging**: Track all user actions and changes
- **Health Checks**: Monitor database and service health
- **API Versioning**: Support for multiple API versions
- **Swagger Documentation**: Interactive API documentation
- **Global Exception Handling**: Centralized error handling
- **Response Caching**: Improve performance with caching
- **CORS Support**: Configure cross-origin requests
- **Structured Logging**: Using Serilog with file and console outputs

## 📋 Prerequisites

- .NET 9.0 SDK
- PostgreSQL 12+
- Visual Studio 2022 or VS Code

## 🛠️ Setup Instructions

### 1. Database Setup

```bash
# Install PostgreSQL and create database
createdb AdminServiceDb

# Update connection string in appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=AdminServiceDb;Username=your_username;Password=your_password"
}
```

### 2. Configuration

```bash
# Update JWT settings in appsettings.json
"JwtSettings": {
  "SecretKey": "your-super-secret-key-that-is-at-least-32-characters-long",
  "Issuer": "AdminService",
  "Audience": "AdminServiceAPI"
}
```

### 3. Run the Application

```bash
# Navigate to project directory
cd server/admin-service/admin-service

# Restore packages
dotnet restore

# Run the application
dotnet run
```

### 4. Access the API

- **API Base URL**: `https://localhost:7000`
- **Swagger UI**: `https://localhost:7000`
- **Health Check**: `https://localhost:7000/health`
- **API Info**: `https://localhost:7000/info`

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /login` - Authenticate user
- `POST /refresh` - Refresh access token
- `POST /logout` - Logout user
- `POST /change-password` - Change password

### Admin Users (`/api/v1/adminusers`)

- `GET /` - Get all users (paginated)
- `GET /{id}` - Get user by ID
- `GET /me` - Get current user profile
- `POST /` - Create new user (SuperAdmin only)
- `PUT /{id}` - Update user (SuperAdmin only)
- `DELETE /{id}` - Delete user (SuperAdmin only)

### Hotels (`/api/v1/hotels`) - To be implemented

- Full CRUD operations for hotel management

### Rooms (`/api/v1/rooms`) - To be implemented

- Full CRUD operations for room management

## 🔐 Authentication & Authorization

### Roles

- **SuperAdmin**: Full system access
- **Admin**: Manage hotels, rooms, and view users
- **Manager**: View-only access to most resources

### JWT Token Structure

```json
{
  "nameid": "user-guid",
  "unique_name": "username",
  "role": "SuperAdmin|Admin|Manager",
  "jti": "token-id",
  "iat": "issued-at-timestamp"
}
```

## 🗄️ Database Schema

### Tables

- `admin_users` - Admin user accounts
- `hotels` - Hotel information
- `rooms` - Room details
- `hotel_amenities` - Hotel amenities
- `room_amenities` - Room amenities
- `user_sessions` - User session management
- `audit_logs` - Audit trail

### Key Features

- **Soft Delete**: Entities are marked as deleted rather than physically removed
- **Audit Trail**: Automatic tracking of created/updated timestamps and users
- **UUID Primary Keys**: Using GUIDs for all primary keys
- **Proper Indexing**: Optimized indexes for common queries

## 🧪 Testing

### Unit Tests (To be implemented)

```bash
dotnet test
```

### Integration Tests (To be implemented)

```bash
dotnet test --filter Category=Integration
```

## 📦 Docker Support (To be implemented)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
# ... Docker configuration
```

## 🔧 Development Guidelines

### Code Style

- Follow C# coding conventions
- Use meaningful names for classes, methods, and variables
- Implement proper error handling
- Write comprehensive unit tests
- Document public APIs

### Adding New Features

1. Start with Domain layer (entities, repository interfaces)
2. Implement Application layer (DTOs, services, validators)
3. Add Infrastructure implementations
4. Create API controllers
5. Write tests
6. Update documentation

### Database Migrations

```bash
# Add migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

## 🚀 Deployment

### Production Considerations

- Use environment variables for sensitive configuration
- Enable HTTPS redirect
- Configure proper CORS origins
- Set up monitoring and logging
- Implement rate limiting
- Use connection pooling
- Enable response compression

## 📈 Monitoring & Observability

- **Health Checks**: `/health` endpoint
- **Structured Logging**: Serilog with JSON output
- **Metrics**: Application metrics (to be implemented)
- **Distributed Tracing**: OpenTelemetry (to be implemented)

## 🔄 CI/CD Pipeline (To be implemented)

- Automated testing
- Code quality checks
- Security scanning
- Docker image building
- Deployment automation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For questions or issues, please contact the development team or create an issue in the repository.
