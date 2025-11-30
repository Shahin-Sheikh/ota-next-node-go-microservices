# System Architecture Diagram

## Current Implementation: HTTP + Kafka

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │ Admin Frontend   │              │ Customer Frontend│         │
│  │    (Vite)        │              │    (Next.js)     │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            │ HTTP/REST                        │ HTTP/REST
            │                                  │
┌───────────┼──────────────────────────────────┼──────────────────┐
│           │         API GATEWAY              │                   │
│           └──────────────┬───────────────────┘                   │
└──────────────────────────┼─────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Auth Service │  │Admin Service │  │Customer Svc  │
│   (Node.js)  │  │  (.NET Core) │  │  (Node.js)   │
│              │  │              │  │              │
│ - JWT Auth   │  │ - Admin Ops  │  │ - Customer   │
│ - Service    │  │ - CRM        │  │   Operations │
│   Registry   │  │              │  │ - Hotel List │──┐
└──────────────┘  └──────────────┘  │   (Consumer) │  │
                                    └──────┬───────┘  │
                                           │          │
                                    ┌──────▼───────┐  │
                                    │    Kafka     │  │
                                    │   Consumer   │  │
                                    │              │  │
                                    │ Subscribes:  │  │
                                    │ • hotel.*    │  │
                                    └──────▲───────┘  │
                                           │          │
                                           │          │ HTTP
                                           │          │ GET
                                           │          │
                  ┌────────────────────────┴──────────┘
                  │ Kafka Events
                  │
         ┌────────┴──────────┐
         │  Apache Kafka     │
         │  Message Broker   │
         │                   │
         │  Topics:          │
         │  • hotel.created  │
         │  • hotel.updated  │
         │  • hotel.status   │
         │  • hotel.deleted  │
         └────────▲──────────┘
                  │
                  │ Publishes Events
                  │
         ┌────────┴──────────┐
         │  Hotel Service    │
         │    (Node.js)      │
         │                   │
         │ - Hotel CRUD      │
         │ - Room Mgmt       │
         │ - Public API      │
         │ - Kafka Producer  │
         └────────┬──────────┘
                  │
         ┌────────▼──────────┐
         │   PostgreSQL      │
         │  (Hotel DB)       │
         └───────────────────┘
```

## Data Flow

### 1. Hotel Creation Flow

```
Admin → Hotel Service → [1] Create Hotel in DB
                     → [2] Publish to Kafka (hotel.created)
                     → [3] Customer Service consumes event
                     → [4] Cache/Process event
```

### 2. Hotel List Flow (Customer Service)

```
Customer Frontend → Customer Service → HTTP GET → Hotel Service
                                                 → Return Active Hotels
                    ← JSON Response ←───────────┘
```

### 3. Hotel Update Flow

```
Admin → Hotel Service → [1] Update Hotel in DB
                     → [2] Publish to Kafka (hotel.updated)
                     → [3] Customer Service consumes event
                     → [4] Invalidate cache/Update local data
```

## Service Communication Matrix

| From Service      | To Service       | Protocol | Purpose                |
| ----------------- | ---------------- | -------- | ---------------------- |
| Customer Service  | Hotel Service    | HTTP     | Get hotel list/details |
| Hotel Service     | Kafka            | Kafka    | Publish hotel events   |
| Customer Service  | Kafka            | Kafka    | Consume hotel events   |
| Admin Frontend    | Hotel Service    | HTTP     | CRUD operations        |
| Customer Frontend | Customer Service | HTTP     | Get hotels for booking |

## Future Architecture: gRPC + Kafka

```
┌─────────────────────────────────────────────────────────────────┐
│                      MICROSERVICES LAYER                         │
│                                                                   │
│  ┌──────────────┐                         ┌──────────────┐      │
│  │ Customer Svc │◄────── gRPC ──────────► │ Hotel Service│      │
│  │              │                         │              │      │
│  │ gRPC Client  │                         │ gRPC Server  │      │
│  └──────┬───────┘                         └──────┬───────┘      │
│         │                                        │              │
│         │ Kafka                          Kafka   │              │
│         ▼                                        ▼              │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              Apache Kafka (Event Bus)                │       │
│  │  • hotel.created   • hotel.updated                   │       │
│  │  • hotel.deleted   • hotel.status.changed            │       │
│  └─────────────────────────────────────────────────────┘       │
└───────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Services

- **Auth Service**: Node.js + Express + JWT
- **Admin Service**: .NET Core (C#)
- **Customer Service**: Node.js + Express + SQL Server
- **Hotel Service**: Node.js + Express + PostgreSQL
- **CRM Service**: .NET Core (C#)

### Message Broker

- **Apache Kafka**: Event streaming platform
- **KafkaJS**: Node.js client for Kafka

### Communication

- **Current**: HTTP REST APIs
- **Future**: gRPC for service-to-service
- **Async**: Kafka for event-driven communication

### Databases

- **PostgreSQL**: Hotel Service
- **SQL Server**: Customer Service
- **Others**: Auth, Admin, CRM services

### Frontend

- **Admin**: Vite + React + TypeScript
- **Customer**: Next.js + React + TypeScript

## Deployment Considerations

### Docker Compose

```yaml
services:
  - zookeeper
  - kafka
  - kafka-ui
  - hotel-service
  - customer-service
  - auth-service
  - admin-service
  - crm-service
  - api-gateway
```

### Environment Variables

- Each service has its own .env file
- Kafka brokers configured centrally
- Service URLs configured for inter-service communication

### Scaling

- Horizontal scaling of services
- Multiple Kafka consumers for load distribution
- Load balancer for API Gateway
- Database read replicas

## Security

- **JWT Authentication**: Service-to-service auth
- **API Gateway**: Single entry point
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse

## Monitoring & Observability

### Recommended Tools

- **Logging**: Winston, Morgan
- **Metrics**: Prometheus
- **Tracing**: Jaeger
- **Kafka UI**: Monitor topics and messages
- **APM**: New Relic or DataDog

## Key Design Decisions

1. ✅ **Microservices Architecture**: Separate concerns
2. ✅ **Event-Driven**: Kafka for async communication
3. ✅ **HTTP REST**: Simple, widely supported
4. ✅ **Future gRPC**: Performance optimization path
5. ✅ **Service Registry**: Auth service maintains registry
6. ✅ **Database per Service**: Data isolation
7. ✅ **API Gateway**: Centralized routing
8. ✅ **CQRS Pattern**: Read/write separation via Kafka

## Benefits

- **Scalability**: Each service scales independently
- **Resilience**: Services can fail independently
- **Flexibility**: Mix of technologies (.NET, Node.js)
- **Performance**: Async processing via Kafka
- **Maintainability**: Clear service boundaries
- **Future-Proof**: Easy to migrate to gRPC
